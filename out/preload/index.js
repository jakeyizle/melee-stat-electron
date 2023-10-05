"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const api = {
  removeListener: (channel) => {
    electron.ipcRenderer.removeAllListeners(channel);
  },
  listenForGameLoad: (cb) => {
    electron.ipcRenderer.on("database-game-loaded", (_event, args) => {
      const { currentFileCount, maxFileCount } = args;
      cb(currentFileCount, maxFileCount);
    });
  },
  listenForLiveReplay: (cb) => {
    electron.ipcRenderer.on("live-replay-loaded", async (_event, args) => {
      const { liveGame, games } = args;
      liveGame.players = await Promise.all(
        liveGame?.players.map(async (player) => {
          player.rankedSeasons = await electron.ipcRenderer.invoke("getRankedSeasons", player.connectCode);
          return player;
        })
      );
      cb(liveGame, games);
    });
  }
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
}
