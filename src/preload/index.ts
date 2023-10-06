import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  removeListener: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  },
  listenForGameLoad: (cb: Function) => {
    ipcRenderer.on('database-game-loaded', (_event, args) => {
      const { currentFileCount, maxFileCount } = args
      cb(currentFileCount, maxFileCount)
    })
  },
  listenForLiveReplay: (cb: Function) => {
    ipcRenderer.on('live-replay-loaded', async (_event, args) => {
      const { liveGame, games } = args
      cb(liveGame, games)
    })
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}



