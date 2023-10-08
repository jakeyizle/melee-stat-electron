import { parentPort, workerData } from 'worker_threads'
import { SlippiGame } from '@slippi/slippi-js'
import { join } from 'path'

let { files, appDataPath } = workerData
const minFrames = 30 * 60
const db = require('better-sqlite3')(join(appDataPath, 'melee2.db'))

const gameStmt = db.prepare(
  'INSERT OR IGNORE INTO games (name, path, stage, winner, dateTime) VALUES (@name, @path, @stage, @winner, @dateTime)'
)
const insertGame = (game: Game) => {
  return gameStmt.run(game)
}

const playerStmt = db.prepare(
  'INSERT OR IGNORE INTO players (connectCode, characterId, gameId) VALUES (@connectCode, @characterId, @gameId)'
)
const insertPlayer = (player: Player) => {
  return playerStmt.run(player)
}

const badGameStmt = db.prepare(
  'INSERT OR IGNORE INTO badGames (name, path, reason) VALUES (@name, @path, @reason)'
)
const insertBadGame = (game: BadGame) => {
  return badGameStmt.run(game)
}

files.forEach((file: { path: any; name: any }) => {
  let times: any = []
  const startTime = Date.now()
  try {
    function shouldSkipGame(game: SlippiGame, minFrames: any) {
      //too short
      // const lastFrame = game.getLatestFrame()
      // if (lastFrame && lastFrame.frame < minFrames) return 'too-short'
      // times.push(getTime(startTime, 'lastFrame'))

      //cpu
      const settings = game.getSettings()
      let skip = false
      settings?.players.forEach((player) => {
        if (player.type != 0) skip = true
      })
      if (skip) return 'cpu'
      times.push(getTime(startTime, 'cpu'))
      //not 1v1
      if (settings && settings.players.length > 2) {
        return 'not-1v1'
      }
      times.push(getTime(startTime, 'not1v1'))

      return false
    }

    times.unshift(getTime(startTime, 'start'))
    const slippiGame = new SlippiGame(file.path)
    times.push(getTime(startTime, 'game'))
    const settings = slippiGame.getSettings()
    const metadata = slippiGame.getMetadata()
    times.push(getTime(startTime, 'settings/metadata'))
    const winner = getGameWinner(slippiGame)
    times.push(getTime(startTime, 'winner'))
    if (!winner) {
      insertBadGame({ ...file, reason: 'no-winner' })
      return
    }
    const skipReason = shouldSkipGame(slippiGame, minFrames)
    if (skipReason) {
      insertBadGame({ ...file, reason: skipReason })
      return
    }

    times.push(getTime(startTime, 'skip'))

    const game: Game = {
      stage: settings?.stageId || -1,
      winner: getGameWinner(slippiGame),
      dateTime: metadata?.startAt || '',
      name: file.name,
      path: file.path
    }

    const gameInsert = insertGame(game)
    times.push(getTime(startTime, 'game'))

    settings?.players.map((player) => {
      insertPlayer({
        connectCode: player.connectCode || '',
        characterId: player.characterId || -1,
        gameId: gameInsert.lastInsertRowid as string
      })
    })
    times.push(getTime(startTime, 'player'))
  } catch (e: any) {
    insertBadGame({ ...file, reason: 'error' })
    times.push(getTime(startTime, 'badGame'))
  } finally {
    times.push(getTime(startTime, 'fileFinish'))
    parentPort?.postMessage(times)
  }
})

function getGameWinner(game: SlippiGame) {
  const winners = game.getWinners()
  let winnerIndex
  if (!winners) {
    const lastFrame = game.getLatestFrame()
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
    winnerIndex = winners.find((x) => x.position === 0)?.playerIndex
  }
  if (winnerIndex === null || winnerIndex === undefined) return ''
  const settings = game.getSettings()
  return settings?.players[winnerIndex].connectCode || ''
}

function backupGetWinner(winners: Winner[]) {
  if (winners[0].stocks === winners[1].stocks) {
    return lowerPercent(winners)
  }
  return higherStock(winners)
}

function lowerPercent(winners: Winner[]) {
  const arr = winners.filter((x) => x.percent)
  return arr.reduce((a, b) => {
    return a.percent! < b.percent! ? a : b
  }).playerIndex
}

function higherStock(winners: Winner[]) {
  const arr = winners.filter((x) => x.stocks)
  return arr.reduce((a, b) => {
    return a.stocks! > b.stocks! ? a : b
  }).playerIndex
}

function getTime(baseTime: number, label: string) {
  return { dateTime: Date.now() - baseTime, label }
}

type Winner = {
  stocks: number | null | undefined
  playerIndex: number | null | undefined
  percent: number | null | undefined
}

type BadGame = {
  name: string
  path: string
  reason: 'error' | 'cpu' | 'not-1v1' | 'no-frames' | 'no-winner' | 'too-short'
}

type Game = {
  stage: number
  winner: string
  dateTime: string
  name: string
  path: string
}

type Player = {
  connectCode: string
  characterId: number
  gameId: string
}
