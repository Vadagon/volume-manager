var gainNode, audioCtx, streamer,
    tabsLevels = {},
    tabsGaines = {},
    hotkeysType = [true, true],
    fscreen = true,
    muteAll = false;

// ON-INIT DATABASE handler
chrome.storage.sync.get(["hotkeysType", "fscreen", "muteAll", "lastDay"], function(items) {
    if (!chrome.runtime.error) {
        if (items.hasOwnProperty("hotkeysType") && items.hasOwnProperty("fscreen")) {
            hotkeysType = items.hotkeysType;
            fscreen = items.fscreen;
            muteAll = items.muteAll;
        }else{
            chrome.storage.sync.set({ "hotkeysType": hotkeysType, "fscreen": fscreen, "muteAll": muteAll });
        }
        if (!items.hasOwnProperty("lastDay")) {
            var now = new Date();
            var fullDaysSinceEpoch = Math.floor(now/8.64e7);
            chrome.storage.sync.set({ "lastDay": fullDaysSinceEpoch });
        }

    }
});


var sysOS;
chrome.runtime.getPlatformInfo(function(info){
    sysOS = info.os;
})

var prevWindow;





// GOOGLE ANALYSTICS
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-131310674-3']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();