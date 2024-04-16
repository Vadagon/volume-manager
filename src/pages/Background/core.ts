import data from './globals';
// chrome-extension://jcjiagpgoplifgcdkpdefncbbpdjdean/popup.html
// IN-TAB VOLUME INDICATOR handler
export function showVolumeInTabFunc(level: any) {
  var showVolumeInTab =
    "var x = document.querySelectorAll('#VadagonVolumeStatus .VadagonVolumeStatusElems span'); for (var i = " +
    17 +
    " - 1; i >= 0; i--) {x[i].style.backgroundColor = '#1c1c1c';}";
  showVolumeInTab =
    showVolumeInTab +
    "var b = document.getElementById('VadagonVolumeStatus'); b.style.marginTop='-150px'; b.style.opacity = 0.85; " +
    "if(T){clearTimeout(T);} var T = setTimeout(function() { b.style.marginTop='-125px'; b.style.opacity = 0;  }, 3000);";
  if (level > 1) {
    showVolumeInTab =
      showVolumeInTab +
      'for (var i = ' +
      10 +
      " - 1; i >= 0; i--) {x[i].style.backgroundColor = 'white';} for (var i = " +
      (level + 9) +
      " - 1; i >= 10; i--) {x[i].style.backgroundColor = '#ff613f';}";
  } else {
    showVolumeInTab =
      showVolumeInTab +
      'for (var i = ' +
      level * 10 +
      " - 1; i >= 0; i--) {x[i].style.backgroundColor = 'white';}";
  }

  chrome.tabs.executeScript({ code: showVolumeInTab });
}

// SHORTCUTS HANDLER
// export function mainClicker(e: any) {
//   chrome.tabs.query({ currentWindow: true, active: true }, function (tabArray) {
//     var id = tabArray[0].id ?? 0;
//     if (a.getTab(id)) {
//       var resFloat;
//       if (data.tabsLevels[id] < 1 || (data.tabsLevels[id] == 1 && e < 0)) {
//         resFloat = parseInt(Math.floor(data.tabsLevels[id] * 10) + e) / 10;
//       } else {
//         resFloat = data.tabsLevels[id] + e;
//       }
//       if (resFloat > 8) resFloat = 8;
//       if (resFloat < 0) resFloat = 0;
//       data.tabsLevels[id] = resFloat;
//       showVolumeInTabFunc(data.tabsLevels[id]);
//       a.volume(id, data.tabsLevels[id] * 100);
//     } else {
//       a.isMuted(function (isMuted?: boolean) {
//         showVolumeInTabFunc(isMuted ? 0 : 1);
//         a.init(id, isMuted ? 0 : 100);
//       });
//     }
//   });
// }

// AUDIO MAIN CORE FUNCTIONS
export var a = {
  init: async function (id: number, val: number, callback?: Function) {
    const t = (await chrome.tabs.getCurrent())?.id;
    if (!data?.user?.disabled)
      chrome.tabCapture.getMediaStreamId(
        {
          consumerTabId: t,
          targetTabId: id,
        },
        (streamId: string) => {
          console.log(streamId);
          chrome.action.setBadgeText({
            tabId: id,
            text: val.toString(),
          });
          a.volume(id, val, streamId);
        }
      );
    callback && callback();
  },
  isMuted: function (callback: Function) {
    return chrome.tabs.query(
      { currentWindow: true, active: true },
      function (tabs) {
        if (chrome.runtime.lastError) {
          callback(false);
        } else {
          callback(tabs[0].mutedInfo?.muted);
        }
      }
    );
  },
  toMute: function (e: any) {
    chrome.tabs.query({}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        chrome.tabs.update(tabs[i].id ?? -1, {
          muted: e,
        });
      }
    });
  },
  volume: function (id: number, val: number, streamId?: string) {
    chrome.action.setBadgeText({ tabId: id, text: val.toString() });
    this.offScreenVolume(id, val / 100, streamId);
    // data.tabsGaines[id].nodeGain.gain.setTargetAtTime(
    //   data.tabsLevels[id],
    //   0,
    //   0.1
    // );
  },
  // offScreenInit: function (tabId: number, val: number, streamId: string) {
  //   console.log('offScreenInit', tabId, val);
  //   chrome.runtime.sendMessage({
  //     type: 'init',
  //     target: 'offscreen',
  //     tabId: tabId,
  //     streamId: streamId,
  //   });
  // },
  offScreenVolume: function (tabId: number, val: number, streamId?: string) {
    // console.log('offScreenVolume', tabId, val, streamId);
    chrome.runtime.sendMessage({
      type: 'volume',
      target: 'offscreen',
      tabId: tabId,
      val: val,
      streamId: streamId,
    });
  },
  offScreenDelete: function (tabId: number) {
    console.log('offScreenDelete', tabId);
  },
  offScreenDisableAll: function () {
    // for (var tabId in data.tabsLevels)
    console.log('offScreenDisable', 'tabId');
  },
  offScreenData: async function () {
    let res = await chrome.runtime.sendMessage({
      type: 'data',
      target: 'offscreen',
    });
    return res;
  },
};
