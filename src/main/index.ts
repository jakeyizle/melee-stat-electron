import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import createWorker from './worker?nodeWorker'
import { availableParallelism } from 'os'
import * as fs from 'fs'
import { GameStartType, SlippiGame } from '@slippi/slippi-js'
import chokidar from 'chokidar'

const appDataPath = process.env['IS_TEST'] ? '' : app.getPath('appData')
const db = require('better-sqlite3')(join(appDataPath, 'melee2.db'))
db.pragma('journal_mode = WAL')

let win: BrowserWindow
function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  return mainWindow
}

app.whenReady().then(() => {
  initDB()
  startDatabaseLoad()
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  win = createWindow()
  watchForReplays()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) win = createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function initDB() {
  db.prepare(
    `CREATE TABLE IF NOT EXISTS games (
    id Integer Primary Key,
    stage NOT NULL,
      winner NOT NULL,
      dateTime NOT NULL,
      name NOT NULL,
      path NOT NULL,
      indexId)`
  ).run()
  db.prepare(
    `CREATE TABLE IF NOT EXISTS players (
      id Integer Primary Key,
      connectCode NOT NULL,
      characterId NOT NULL,
      gameId NOT NULL,
      FOREIGN KEY (gameId) references games(id)
  )`
  ).run()
  db.prepare(
    `CREATE TABLE IF NOT EXISTS settings (
    key Primary Key,
    value NOT NULL
  )`
  ).run()
  db.prepare(
    `CREATE TABLE IF NOT EXISTS badGames (
    name NOT NULL,
    path NOT NULL,
    reason NOT NULL
  )`
  ).run()
}

let maxFileCount = 0
let currentFileCount = 0
function startDatabaseLoad() {
  const settingsStmt = db.prepare('SELECT value FROM settings WHERE key = ?').pluck()
  // const replayDir: string = settingsStmt.get('replayDirectory');
  const replayDir = 'D:\\SlippiReplays'
  // const loadSpeed = settingsStmt.get('loadSpeed').toLowerCase() == 'true';
  const loadSpeed = true
  // const minimumGameTime = settingsStmt.get('minimumGameTime');
  const files = getNewReplayFiles(replayDir)
  console.log(files.length)
  if (files.length == 0) return
  maxFileCount = files.length
  const threadCount = loadSpeed ? availableParallelism() : 1
  const splitFiles = getSplitFiles(files, threadCount)
  splitFiles.forEach((fileList) => {
    createWorkerThread(fileList, appDataPath)
  })
}
let timesArray: any = [];
function createWorkerThread(files: File[], appDataPath: string) {
  const start = Date.now()
  createWorker({ workerData: { files, appDataPath } }).on('message', (times: any[]) => {
    currentFileCount++
    win.webContents.send('database-game-loaded', { currentFileCount, maxFileCount })
    timesArray.push(times);
    if (currentFileCount === maxFileCount) {
      fs.writeFileSync('D:\\JacobProjects\\melee-stats-experimental\\tests\\results.json', JSON.stringify(timesArray))
      console.log(`dbLoad time - ${Date.now() - start}`);
    }
  })
}

// ipcMain.handle('finish', (event, args) => {
//   let worker = BrowserWindow.getAllWindows().find(x => x.webContents.id == event.sender.id);
//   worker?.close()
//   if (currentFileCount === maxFileCount) {
//     const start = Date.now()
//     db.prepare('UPDATE games SET indexId = -1').run();
//     const gameIds = db.prepare('SELECT id FROM games ORDER BY dateTime').pluck().all();
//     const updateStmt = db.prepare('UPDATE GAMES SET indexId = @index WHERE id = @id');
//     gameIds.map((id: any, index: any) => {
//       updateStmt.run({ index, id })
//     })
//     console.log('time - ', Date.now() - start);
//   }
// })

function getSplitFiles(files: File[], threadCount: number) {
  let fileArr: File[][] = []
  threadCount = threadCount > files.length ? files.length : threadCount
  const step = Math.max(1, Math.floor(files.length / threadCount))
  for (let i = 0; i < threadCount; i++) {
    const arr: File[] = []
    const start = i * step
    const end = i === threadCount - 1 ? files.length : start + step
    for (let j = start; j < end; j++) {
      arr.push(files[j])
    }
    fileArr.push(arr)
  }
  return fileArr
}

//get all files in all subdirectories
function getFiles(path = './') {
  const entries = fs.readdirSync(path, {
    withFileTypes: true
  })
  // Get files within the current directory and add a path key to the file objects
  const files = entries
    .filter((file) => !file.isDirectory())
    .map((file) => ({
      ...file,
      path: join(path, file.name)
    }))

  // Get folders within the current directory
  const folders = entries.filter((folder) => folder.isDirectory())

  /*
      Add the found files within the subdirectory to the files array by calling the
      current function itself
    */
  for (const folder of folders) files.push(...getFiles(`${path}${folder.name}/`))

  return files
}

function getReplayFiles(path: string) {
  let files = getFiles(path)
  //ends in .slp
  let regExp = /.*\.slp$/
  let replays = files.filter((file) => regExp.test(file.name))
  return replays
}

function getNewReplayFiles(path: string) {
  const localFiles = getReplayFiles(path)
  const dbFiles = db.prepare('SELECT name FROM games').pluck().all()
  const badFiles = db.prepare('SELECT name FROM badGames').pluck().all()
  const loadedFiles = dbFiles.concat(badFiles)
  return localFiles.filter((x) => !loadedFiles.includes(x.name))
}

async function getRankedSeasons(connectCode: string) {
  const url = 'https://gql-gateway-dot-slippi.uc.r.appspot.com/graphql'
  const data = JSON.stringify({
    operationName: 'AccountManagementPageQuery',
    variables: {
      cc: connectCode
    },
    query:
      'fragment profileFields on NetplayProfile {\n ratingOrdinal\n wins\n losses\n characters {\n character\n gameCount\n }\n }\n\nfragment userProfilePage on User {\n netplayProfiles {\n ...profileFields\n season {\n name\n status\n }\n }\n }\n\nquery AccountManagementPageQuery($cc: String!) {\n getConnectCode(code: $cc) {\n user {\n ...userProfilePage\n }\n }\n}\n'
  })
  let headers = new Headers()
  headers.append('content-type', 'application/json')
  const requestOptions: RequestInit = {
    method: 'POST',
    body: data,
    redirect: 'follow',
    headers: headers
  }

  const result = await fetch(url, requestOptions)
  const text = await result.text()
  const json = JSON.parse(text)
  return json.data.getConnectCode.user.netplayProfiles
}

declare type File = {
  path: string
  name: string
}

function watchForReplays() {
  const settingsStmt = db.prepare('SELECT value FROM settings WHERE key = ?').pluck()
  // const replayDir: string = settingsStmt.get('replayDirectory')
  let currentPath: string | undefined
  const replayDir = 'D:\\JacobProjects\\melee-stats-experimental\\testFolder'

  //event emitting is different real life vs test
  chokidar.watch(replayDir, { ignoreInitial: true }).on('add', async (path) => {
    console.log('add', path)
    if (!path || !path?.endsWith('.slp') || currentPath === path) return
    currentPath = await processGame(path);
  })

  chokidar.watch(replayDir).on('change', async (path) => {
    console.log('change', path)
    if (!path || !path?.endsWith('.slp') || currentPath === path) return
    currentPath = await processGame(path);
  })
}

async function processGame(path: string) {
  try {
    const gamesStmt = db.prepare(`SELECT * FROM games
    INNER JOIN players p1 ON games.id = p1.gameId
    INNER JOIN players p2 on games.id = p2.gameId
    WHERE p1.connectCode = @connectCode1
    AND p2.connectCode = @connectCode2`)
    const game = new SlippiGame(path)
    const settings = game.getSettings()
    console.log(settings);
    if (!settings) return
    const connectCodes = settings?.players?.map((x) => x.connectCode)
    if (!connectCodes) return
    const games = gamesStmt.all({ connectCode1: connectCodes[0], connectCode2: connectCodes[1] })
    const liveGame = {
      players: getPlayers(settings),
      stage: settings.stageId
    }
    liveGame.players = await Promise.all(
      liveGame?.players.map(async (player) => {
        player.rankedSeasons = await getRankedSeasons(player.connectCode)
        return player
      })
    )
    win?.webContents.send('live-replay-loaded', { liveGame, games })
    return path
  } catch (e) {
    console.error('failed', e)
    return
  }
}

function getPlayers(settings: GameStartType) {
  return settings.players.map((player) => {
    {
      return {
        connectCode: player.connectCode,
        characterId: player.characterId,
        displayName: player.displayName,
        rankedSeasons: null
      }
    }
  })
}
