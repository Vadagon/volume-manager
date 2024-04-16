var tabsLevels: { [index: number]: any } = {};
export var curTab: any;
var tabs: any[] = [];
export var controlledTabs: any[] = [];
export var currentLevel = 100;
export var noizeTabs: any[] = [];
export var OS = 'win';
var port: any;
export function changeVolume(id: any, val: any) {
  console.log(id, val, 'volume!');
  port.postMessage({ id: parseInt(id), val: val });
}
export function changeCurrentVolume(val: any) {
  console.log(curTab, val, 'volume!');
  if (curTab?.id != undefined) changeVolume(curTab.id, val);
}

function analyzeTabs(cb: Function) {
  chrome.tabs.query({ audible: !0 }, function (tabs1) {
    tabs = tabs1;
    for (var i = tabs.length - 1; i >= 0; i--) {
      tabs[i].favIconUrl = tabs[i].favIconUrl;
      tabs[i].tabName = tabs[i].title;
      if (tabsLevels.hasOwnProperty(tabs[i].id)) {
        tabs[i].volumeLevel = tabsLevels[tabs[i].id] * 100;
        controlledTabs.push(tabs[i]);

        if (tabs[i].id === curTab.id) currentLevel = tabs[i].volumeLevel;
      } else {
        tabs[i].volumeLevel = 100;
        noizeTabs.push(tabs[i]);
      }
    }
    cb();
  });
}

export function init(cb: Function) {
  noizeTabs = [];
  controlledTabs = [];

  port = chrome.runtime.connect({
    name: 'Sample Communication',
  });
  // chrome.tabs.query({ currentWindow: true, active: true }, function (tabArray) {
  //   chrome.tabCapture.getMediaStreamId(
  //     {
  //       targetTabId: tabArray[0].id,
  //     },
  //     function (streamId) {
  //       // chrome.action.setBadgeText({
  //       //   tabId: tabArray[0].id,
  //       //   text: '100',
  //       // });
  //       port.postMessage({
  //         type: 'init',
  //         data: tabArray,
  //         connect: true,
  //         streamId: streamId,
  //       });
  //     }
  //   );
  // });
  port.onMessage.addListener(function (msg: any) {
    if (msg.tabsLevels) {
      tabsLevels = msg.tabsLevels;
      curTab = msg.curTab;
      if (tabsLevels[curTab.id] && curTab.active)
        currentLevel = tabsLevels[curTab.id] * 100;
      analyzeTabs(cb);
    }
    console.log(msg);
  });
}
