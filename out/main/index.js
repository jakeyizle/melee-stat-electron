"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const node_worker_threads = require("node:worker_threads");
const os = require("os");
const fs = require("fs");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const icon = path.join(__dirname, "../../resources/icon.png");
function createWorker(options) {
  return new node_worker_threads.Worker(require.resolve("./worker-3eac60e4.js"), options);
}
const appDataPath = process.env["IS_TEST"] ? "" : electron.app.getPath("appData");
const db = require("better-sqlite3")(path.join(appDataPath, "melee2.db"));
db.pragma("journal_mode = WAL");
let win;
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  return mainWindow;
}
electron.app.whenReady().then(() => {
  initDB();
  startDatabaseLoad();
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  win = createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0)
      win = createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
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
  ).run();
  db.prepare(
    `CREATE TABLE IF NOT EXISTS players (
      id Integer Primary Key,
      connectCode NOT NULL,
      characterId NOT NULL,
      gameId NOT NULL,
      FOREIGN KEY (gameId) references games(id)
  )`
  ).run();
  db.prepare(
    `CREATE TABLE IF NOT EXISTS settings (
    key Primary Key,
    value NOT NULL
  )`
  ).run();
  db.prepare(
    `CREATE TABLE IF NOT EXISTS badGames (
    name NOT NULL,
    path NOT NULL
  )`
  ).run();
}
let maxFileCount = 0;
let currentFileCount = 0;
function startDatabaseLoad() {
  db.prepare("SELECT value FROM settings WHERE key = ?").pluck();
  const replayDir = "D:\\SlippiReplays";
  const files = getNewReplayFiles(replayDir);
  console.log(files.length);
  if (files.length == 0)
    return;
  maxFileCount = files.length;
  const threadCount = os.availableParallelism();
  const splitFiles = getSplitFiles(files, threadCount);
  splitFiles.forEach((fileList) => {
    createWorkerThread(fileList, appDataPath);
  });
}
function createWorkerThread(files, appDataPath2) {
  createWorker({ workerData: { files, appDataPath: appDataPath2 } }).on("message", (message) => {
    currentFileCount++;
    win.webContents.send("database-game-loaded", { currentFileCount, maxFileCount });
    console.log(currentFileCount, maxFileCount);
  });
}
function getSplitFiles(files, threadCount) {
  let fileArr = [];
  threadCount = threadCount > files.length ? files.length : threadCount;
  const step = Math.max(1, Math.floor(files.length / threadCount));
  for (let i = 0; i < threadCount; i++) {
    const arr = [];
    const start = i * step;
    const end = i === threadCount - 1 ? files.length : start + step;
    for (let j = start; j < end; j++) {
      arr.push(files[j]);
    }
    fileArr.push(arr);
  }
  return fileArr;
}
function getFiles(path$1 = "./") {
  const entries = fs__namespace.readdirSync(path$1, {
    withFileTypes: true
  });
  const files = entries.filter((file) => !file.isDirectory()).map((file) => ({
    ...file,
    path: path.join(path$1, file.name)
  }));
  const folders = entries.filter((folder) => folder.isDirectory());
  for (const folder of folders)
    files.push(...getFiles(`${path$1}${folder.name}/`));
  return files;
}
function getReplayFiles(path2) {
  let files = getFiles(path2);
  let regExp = /.*\.slp$/;
  let replays = files.filter((file) => regExp.test(file.name));
  return replays;
}
function getNewReplayFiles(path2) {
  const localFiles = getReplayFiles(path2);
  const dbFiles = db.prepare("SELECT name FROM games").pluck().all();
  const badFiles = db.prepare("SELECT name FROM badGames").pluck().all();
  const loadedFiles = dbFiles.concat(badFiles);
  return localFiles.filter((x) => !loadedFiles.includes(x.name));
}
electron.ipcMain.handle("getRankedSeasons", async (event, connectCode) => {
  const url = "https://gql-gateway-dot-slippi.uc.r.appspot.com/graphql";
  const data = JSON.stringify({
    operationName: "AccountManagementPageQuery",
    variables: {
      cc: connectCode
    },
    query: "fragment profileFields on NetplayProfile {\n ratingOrdinal\n wins\n losses\n characters {\n character\n gameCount\n }\n }\n\nfragment userProfilePage on User {\n netplayProfiles {\n ...profileFields\n season {\n name\n status\n }\n }\n }\n\nquery AccountManagementPageQuery($cc: String!) {\n getConnectCode(code: $cc) {\n user {\n ...userProfilePage\n }\n }\n}\n"
  });
  let headers = new Headers();
  headers.append("content-type", "application/json");
  const requestOptions = {
    method: "POST",
    body: data,
    redirect: "follow",
    headers
  };
  const result = await fetch(url, requestOptions);
  const text = await result.text();
  const json = JSON.parse(text);
  return json.data.getConnectCode.user.netplayProfiles;
});
