import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: APIType
  }
}

type APIType = {
  removeListener: (arg0: ChannelString) => void,
  listenForGameLoad: Function,
  listenForLiveReplay: Function,
}

type ChannelString = 'database-game-loaded' | 'live-replay-loaded'
