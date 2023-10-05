import { parentPort, workerData } from 'worker_threads';
import { SlippiGame } from "@slippi/slippi-js";
import { join } from 'path';


    let {
      files,
      appDataPath
    } = workerData;
    const minFrames = 30 * 60;
    const db = require('better-sqlite3')(join(appDataPath, 'melee2.db'));

    const gameStmt = db.prepare("INSERT OR IGNORE INTO games (name, path, stage, winner, dateTime) VALUES (@name, @path, @stage, @winner, @dateTime)");
    const insertGame = (game: Game) => {
      return gameStmt.run(game);
    }

    const playerStmt = db.prepare("INSERT OR IGNORE INTO players (connectCode, characterId, gameId) VALUES (@connectCode, @characterId, @gameId)");
    const insertPlayer = (player: Player) => {
      return playerStmt.run(player);
    }

    const badGameStmt = db.prepare("INSERT OR IGNORE INTO badGames (name, path) VALUES (@name, @path)");
    const insertBadGame = (game: BadGame) => {
      return badGameStmt.run(game);
    }

    files.forEach((file: { path: any; name: any; }) => {
      try {
        const slippiGame = new SlippiGame(file.path);
        const settings = slippiGame.getSettings();
        const metadata = slippiGame.getMetadata();
        const winner = getGameWinner(slippiGame)
        if (shouldSkipGame(slippiGame, minFrames) || !winner) {
          insertBadGame(file);
          return
        }

        const game: Game = {
          stage: settings?.stageId || -1,
          winner: getGameWinner(slippiGame),
          dateTime: metadata?.startAt || '',
          name: file.name,
          path: file.path,
        }

        const gameInsert = insertGame(game);
        settings?.players.map(player => {
          insertPlayer ({
            connectCode: player.connectCode || '',
            characterId: player.characterId || -1,
            gameId: gameInsert.lastInsertRowid as string
          })
        })
      } catch (e: any) {
        insertBadGame(file);
        console.error(e);
      } finally {
        parentPort?.postMessage('file done');
      }
    })


function getGameWinner(game: SlippiGame) {
  const winners = game.getWinners();
  let winnerIndex;
  if (!winners) {
    const lastFrame = game.getLatestFrame();
    const firstPlayer: Winner = {
      stocks: lastFrame?.players[0]?.post.stocksRemaining,
      playerIndex: lastFrame?.players[0]?.post.playerIndex,
      percent: lastFrame?.players[0]?.post.percent
    }
    const secondPlayer: Winner = {
      stocks: lastFrame?.players[1]?.post.stocksRemaining,
      playerIndex: lastFrame?.players[1]?.post.playerIndex,
      percent: lastFrame?.players[1]?.post.percent
    }
    winnerIndex = backupGetWinner([firstPlayer, secondPlayer])
  } else {
    winnerIndex = winners.find(x => x.position === 0)?.playerIndex;
  }
  if (winnerIndex === null || winnerIndex === undefined) return '';
  const settings = game.getSettings();
  return settings?.players[winnerIndex].connectCode || '';
}

function shouldSkipGame(game: SlippiGame, minFrames: any) {
  //too short
  const lastFrame = game.getLatestFrame();
  if (lastFrame && lastFrame.frame < minFrames) return true;

  //cpu
  const settings = game.getSettings();
  let skip = false;
  settings?.players.forEach(player => {
    if (player.type != 0) skip = true;
  })
  if (skip) return true;

  //not 1v1
  if (settings && settings.players.length > 2) {
    return true;
  }

  //bad game
  const frames = game.getFrames();
  if (!frames || !settings) return true;

  return false
}

function backupGetWinner(winners: Winner[]) {
  if (winners[0].stocks === winners[1].stocks) {
    return lowerPercent(winners)
  }
  return higherStock(winners);

}

function lowerPercent(winners: Winner[]) {
  const arr = winners.filter(x => x.percent);
  return arr.reduce((a, b) => {
    return a.percent! < b.percent! ? a : b;
  }).playerIndex;
}

function higherStock(winners: Winner[]) {
  const arr = winners.filter(x => x.stocks);
  return arr.reduce((a, b) => {
    return a.stocks! > b.stocks! ? a : b;
  }).playerIndex;
}

type Winner = {
  stocks: number | null | undefined,
  playerIndex: number | null | undefined,
  percent: number | null | undefined
}

type BadGame = {
  name: string,
  path: string,
}

type Game = {
  stage: number,
  winner: string,
  dateTime: string,
  name: string,
  path: string,
}

type Player = {
  connectCode: string,
  characterId: number,
  gameId: string
}
