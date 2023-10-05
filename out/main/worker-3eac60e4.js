"use strict";
const worker_threads = require("worker_threads");
const slippiJs = require("@slippi/slippi-js");
const path = require("path");
let {
  files,
  appDataPath
} = worker_threads.workerData;
const minFrames = 30 * 60;
const db = require("better-sqlite3")(path.join(appDataPath, "melee2.db"));
const gameStmt = db.prepare("INSERT OR IGNORE INTO games (name, path, stage, winner, dateTime) VALUES (@name, @path, @stage, @winner, @dateTime)");
const insertGame = (game) => {
  return gameStmt.run(game);
};
const playerStmt = db.prepare("INSERT OR IGNORE INTO players (connectCode, characterId, gameId) VALUES (@connectCode, @characterId, @gameId)");
const insertPlayer = (player) => {
  return playerStmt.run(player);
};
const badGameStmt = db.prepare("INSERT OR IGNORE INTO badGames (name, path) VALUES (@name, @path)");
const insertBadGame = (game) => {
  return badGameStmt.run(game);
};
files.forEach((file) => {
  try {
    const slippiGame = new slippiJs.SlippiGame(file.path);
    const settings = slippiGame.getSettings();
    const metadata = slippiGame.getMetadata();
    const winner = getGameWinner(slippiGame);
    if (shouldSkipGame(slippiGame, minFrames) || !winner) {
      insertBadGame(file);
      return;
    }
    const game = {
      stage: settings?.stageId || -1,
      winner: getGameWinner(slippiGame),
      dateTime: metadata?.startAt || "",
      name: file.name,
      path: file.path
    };
    const gameInsert = insertGame(game);
    settings?.players.map((player) => {
      insertPlayer({
        connectCode: player.connectCode || "",
        characterId: player.characterId || -1,
        gameId: gameInsert.lastInsertRowid
      });
    });
  } catch (e) {
    insertBadGame(file);
    console.error(e);
  } finally {
    worker_threads.parentPort?.postMessage("file done");
  }
});
function getGameWinner(game) {
  const winners = game.getWinners();
  let winnerIndex;
  if (!winners) {
    const lastFrame = game.getLatestFrame();
    const firstPlayer = {
      stocks: lastFrame?.players[0]?.post.stocksRemaining,
      playerIndex: lastFrame?.players[0]?.post.playerIndex,
      percent: lastFrame?.players[0]?.post.percent
    };
    const secondPlayer = {
      stocks: lastFrame?.players[1]?.post.stocksRemaining,
      playerIndex: lastFrame?.players[1]?.post.playerIndex,
      percent: lastFrame?.players[1]?.post.percent
    };
    winnerIndex = backupGetWinner([firstPlayer, secondPlayer]);
  } else {
    winnerIndex = winners.find((x) => x.position === 0)?.playerIndex;
  }
  if (winnerIndex === null || winnerIndex === void 0)
    return "";
  const settings = game.getSettings();
  return settings?.players[winnerIndex].connectCode || "";
}
function shouldSkipGame(game, minFrames2) {
  const lastFrame = game.getLatestFrame();
  if (lastFrame && lastFrame.frame < minFrames2)
    return true;
  const settings = game.getSettings();
  let skip = false;
  settings?.players.forEach((player) => {
    if (player.type != 0)
      skip = true;
  });
  if (skip)
    return true;
  if (settings && settings.players.length > 2) {
    return true;
  }
  const frames = game.getFrames();
  if (!frames || !settings)
    return true;
  return false;
}
function backupGetWinner(winners) {
  if (winners[0].stocks === winners[1].stocks) {
    return lowerPercent(winners);
  }
  return higherStock(winners);
}
function lowerPercent(winners) {
  const arr = winners.filter((x) => x.percent);
  return arr.reduce((a, b) => {
    return a.percent < b.percent ? a : b;
  }).playerIndex;
}
function higherStock(winners) {
  const arr = winners.filter((x) => x.stocks);
  return arr.reduce((a, b) => {
    return a.stocks > b.stocks ? a : b;
  }).playerIndex;
}
