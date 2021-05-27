var tabsLevels = {};
export var curTab;
var tabs;
export var controlledTabs = [];
export var currentLevel = 100;
export var noizeTabs = [];
export var OS = "win";
var port;
export function changeVolume(id, val) {
  console.log(id, val);
  port.postMessage({ id: parseInt(id), val: val });
}
export function changeCurrentVolume(val) {
  console.log(curTab);
  if (curTab.id) changeVolume(curTab.id, val);
}

function analyzeTabs(cb) {
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

export function init(cb) {
  noizeTabs = [];
  controlledTabs = [];

  port = chrome.runtime.connect({
    name: "Sample Communication",
  });

  port.onMessage.addListener(function (msg) {
    if (msg.tabsLevels) {
      tabsLevels = msg.tabsLevels;
      curTab = msg.curTab;
      OS = msg.OS;
      if (tabsLevels[curTab.id] && curTab.active)
        currentLevel = tabsLevels[curTab.id] * 100;
      analyzeTabs(cb);
    }
    console.log(msg);
  });
}
