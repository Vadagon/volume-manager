import * as utils from './utils';

interface DataType {
  user: {
    uid: string;
    firstDayInited: number;
    fullscreen: boolean;
    darkmode: boolean;
    disabled: boolean;
    muteall: boolean;
    [key: string]: string | number | boolean; // Index signature
  };
  currentTab?: chrome.tabs.Tab;
}

var data: DataType = {
  user: {
    uid: utils.getRandomToken(),
    firstDayInited: utils.fullDaysSinceEpoch(),
    fullscreen: true,
    darkmode: false,
    disabled: false,
    muteall: false,
  },
  currentTab: undefined,
};

export async function dataInit(cb: Function) {
  chrome.storage.local.get(['data'], function (items) {
    if (items && items.data) {
      data = items.data;
    } else {
      chrome.storage.local.set({ user: data });
    }
    cb();
  });
}

export default data;
