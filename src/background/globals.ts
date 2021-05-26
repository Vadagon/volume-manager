import * as utils from "./utils";

var data = {
  user: {
    version: chrome.runtime.getManifest().version,
    uid: utils.getRandomToken(),
    firstDayInited: utils.fullDaysSinceEpoch(),
    fullscreen: true,
    darkmode: false,
    disabled: false,
    muteall: false,
  },
  _gaq: null,
  OS: null,
  prevFullScreen: null,
  currentTab: null,
  prevWindow: null,
  gainNode: null,
  audioCtx: null,
  streamer: null,
  tabsLevels: {},
  tabsGaines: {},
};

export default data;
