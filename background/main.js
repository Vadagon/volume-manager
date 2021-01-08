// chrome-extension://jcjiagpgoplifgcdkpdefncbbpdjdean/popup.html

var gainNode, audioCtx, streamer,
  tabsLevels = {},
  tabsGaines = {},
  hotkeysType = [true, true],
  fscreen = true,
  muteAll = false;

// ON-INIT DATABASE handler
chrome.storage.sync.get(["hotkeysType", "fscreen", "muteAll", "lastDay", "userid", "isPRO"], function(items) {
  if (!chrome.runtime.error) {
    if (items.hasOwnProperty("hotkeysType") && items.hasOwnProperty("fscreen")) {
      hotkeysType = items.hotkeysType;
      fscreen = items.fscreen;
      muteAll = items.muteAll;
    } else {
      chrome.storage.sync.set({ "hotkeysType": hotkeysType, "fscreen": fscreen, "muteAll": muteAll });
    }
    if (!items.hasOwnProperty("lastDay")) {
      var now = new Date();
      var fullDaysSinceEpoch = Math.floor(now / 8.64e7);
      chrome.storage.sync.set({ "lastDay": fullDaysSinceEpoch });
    }

    if(items.isPRO) PRO.enable()

    var userid = items.userid;
    if (userid) {
        useToken(userid);
    } else {
        userid = getRandomToken();
        chrome.storage.sync.set({userid: userid}, function() {
            useToken(userid);
        });
    }
    function useToken(userid) {
        PRO.userid = userid;
    }


  }
});


var sysOS;
chrome.runtime.getPlatformInfo(function(info) {
  sysOS = info.os;
})

var prevWindow;




function getRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
}


// GOOGLE ANALYSTICS
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-131310674-3']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();