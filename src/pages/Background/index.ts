import data from './globals';

async function Init() {
  const exists = await hasOffscreenDocument();
  if (!exists)
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: [chrome.offscreen.Reason.USER_MEDIA],
      justification:
        'Capture MediaStream (audio only) of every tab user will choose to change volume of (chrome.tabCapture API)',
    });
}
Init();

// chrome.storage.local.get(['user'], function (items) {
//   console.log('items.user', items.user);
//   if (items && items.user) {
//     data.user = items.user;
//   } else {
//     chrome.storage.local.set({ user: data.user });
//   }
// });

// chrome.runtime.getPlatformInfo(function (info) {
//   data.OS = info.os;
// });

import './listeners';
import { hasOffscreenDocument } from './utils';
