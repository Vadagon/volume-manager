// TABS REMOVER listener - to purge memory
import data, { dataInit } from './globals';
import { a, mainClicker } from './core';

chrome.tabs.onRemoved.addListener(function (tabId) {
  a.offScreenDelete(tabId);
  // Object.prototype.hasOwnProperty.call(data.tabsGaines, a) &&
  //   data.tabsLevels[a].audioCtx.close().then(function () {
  //     delete data.tabsLevels[a];
  //     delete data.tabsGaines[a];
  //   });
});

// CHROME SHORTCUTS
chrome.commands.onCommand.addListener(function (command) {
  if (command.indexOf('toggle-up') != -1) mainClicker(1);
  if (command.indexOf('toggle-down') != -1) mainClicker(-1);
});

// // AUDIO CAPTURE CHANGES listener
// chrome.tabCapture.onStatusChanged.addListener(function (info) {
//   if (!data.user.fullscreen) return;
//   if (chrome.runtime.lastError) return;

//   console.log(data.user.fullscreen);
//   if (data.OS == 'mac' && info.fullscreen) {
//     chrome.windows.getCurrent(function (win) {
//       data.prevWindow = win;
//       console.log(win);
//       chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
//         data.prevWindow.tabIndex = tab[0].index;
//         if (!data.user.fullscreen)
//           chrome.windows.create(
//             {
//               type: 'popup',
//               state: 'maximized',
//               tabId: info.tabId,
//             },
//             function (e) {
//               console.log(e);
//               chrome.windows.update(e?.id ?? -1, { state: 'fullscreen' });
//             }
//           );
//       });
//     });
//   } else if (info.fullscreen && data.OS != 'mac') {
//     if (!data.prevFullScreen) {
//       chrome.windows.getCurrent(function (win) {
//         data.prevWindow = win;
//         if (data.user.fullscreen && win.id != undefined)
//           chrome.windows.update(win.id, { state: 'fullscreen' });
//       });
//     }
//   } else if (data.OS != 'mac' && data.prevWindow) {
//     chrome.windows.getCurrent(function (win) {
//       if (data.user.fullscreen && win.id != undefined)
//         chrome.windows.update(win.id, { state: data.prevWindow.state });
//     });
//   } else if (data.OS == 'mac' && data.prevWindow) {
//     if (!data.user.fullscreen)
//       chrome.tabs.move(
//         info.tabId,
//         { windowId: data.prevWindow.id, index: data.prevWindow.tabIndex },
//         () => {
//           chrome.tabs.update(info.tabId, { active: true, highlighted: true });
//         }
//       );
//   }

//   data.prevFullScreen = info.fullscreen;
// });

// NEW TABS listener - to mute if needed
chrome.tabs.onCreated.addListener(function (e) {
  if (data.user.muteall && e.id != undefined)
    chrome.tabs.update(e.id, {
      muted: !0,
    });
});

// POPUP PORT CONNECTION listener
chrome.runtime.onConnect.addListener(function (port) {
  // dataInit(() => {
  console.log('onInitConnectionAgain');
  port.onMessage.addListener(function (e) {
    console.log('onmessage,', e.id, e.val);
    if (!data.user.disabled) a.volume(e.id, e.val);
    // a.getTab(e.id) ? a.volume(e.id, e.val) : a.init(e.id, e.val);
  });
  chrome.tabs.query(
    { currentWindow: true, active: true },
    async function (tabArray) {
      const _data = await a.offScreenData();
      data.currentTab = tabArray[0];
      if (
        data.currentTab &&
        data.currentTab?.id &&
        !_data.tabsLevels[data.currentTab?.id]
        //  data.currentTab.audible &&
      ) {
        console.log('init again');
        _data.tabsLevels[data.currentTab?.id ?? -1] ??= 1;
        a.init(data.currentTab.id, 100, function () {
          console.log(' after init port.postMessage');
          port.postMessage({
            tabsLevels: _data.tabsLevels,
            curTab: data.currentTab,
          });
        });
      } else {
        console.log('port.postMessage', _data);
        port.postMessage({
          tabsLevels: { ...(_data.tabsLevels ?? {}) },
          curTab: data.currentTab,
        });
      }
    }
  );
  // });
});

// SIMPLE POPUP MESSAGES listener
chrome.runtime.onMessage.addListener(function (
  request: { how: string; endpoint: string; what: string; data: any },
  sender,
  sendResponse
) {
  if (request.endpoint == 'settings') {
    data.user[request.how] = request.data;
    chrome.storage.local.set({ users: data.user });
    if (request.how == 'disabled')
      request.data
        ? a.offScreenDisableAll()
        : a.init(data.currentTab?.id ?? -1, 100);
    if (request.how == 'muteall') a.toMute(request.data);
    console.log(data.user);
  }
});
