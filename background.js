var gainNode, audioCtx, streamer,
    tabsLevels = {},
    tabsGaines = {},
    hotkeysType = [true, true],
    fscreen = true,
    muteAll = false;
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

// function for icons when user switch tabs

function showVolumeInTabFunc(level) {

    var showVolumeInTab = "var x = document.querySelectorAll('#VadagonVolumeStatus .VadagonVolumeStatusElems span'); for (var i = " + 17 + " - 1; i >= 0; i--) {x[i].style.backgroundColor = '#1c1c1c';}";
    showVolumeInTab = showVolumeInTab +
        "var b = document.getElementById('VadagonVolumeStatus'); b.style.marginTop='-150px'; b.style.opacity = 0.85; " +
        "if(T){clearTimeout(T);} var T = setTimeout(function() { b.style.marginTop='-125px'; b.style.opacity = 0;  }, 3000);";
    if (level > 1) {
        showVolumeInTab = showVolumeInTab + "for (var i = " + 10 + " - 1; i >= 0; i--) {x[i].style.backgroundColor = 'white';} for (var i = " + (level + 9) + " - 1; i >= 10; i--) {x[i].style.backgroundColor = '#ff613f';}";
    } else {
        showVolumeInTab = showVolumeInTab + "for (var i = " + level * 10 + " - 1; i >= 0; i--) {x[i].style.backgroundColor = 'white';}";
    }

    chrome.tabs.executeScript(null, { code: showVolumeInTab })
}
chrome.tabs.onRemoved.addListener(function(a) {
    Object.prototype.hasOwnProperty.call(tabsGaines, a) && tabsGaines[a].audioCtx.close()
        .then(function() {
            delete tabsLevels[a];
            delete tabsGaines[a];
        })
});

function mainClicker(e) {
    chrome.tabs.query({ currentWindow: true, active: true }, function(tabArray) {
        var id = tabArray[0].id;
        if (a.getTab(id)) {
            var resFloat;
            if(tabsLevels[id] < 1 || (tabsLevels[id] == 1 && e < 0)){
                resFloat = parseInt(Math.floor(tabsLevels[id] * 10) + e) / 10;
            }else{
                resFloat = tabsLevels[id] + e;
            }
            if(resFloat>8) resFloat = 8;
            if (resFloat<0) resFloat = 0;
            tabsLevels[id] = resFloat;
            showVolumeInTabFunc(tabsLevels[id]);
            a.volume(id, tabsLevels[id] * 100);
        } else {
            a.isMuted(function(isMuted){
                showVolumeInTabFunc(isMuted?0:1);
                a.init(id, isMuted?0:100);
            })
        }

    });
}
var a = {
    init: function(id, val, callback) {
        tabsLevels[id] = parseFloat(val) / 100;
        if (Object.keys(tabsGaines).length < 6)
            chrome.tabCapture.capture({
                audio: !0,
                video: !1
            }, function(stream) {
                tabsGaines[id] = {};
                tabsGaines[id].audioCtx = new window.AudioContext;
                tabsGaines[id].streamer = stream;
                tabsGaines[id].source = tabsGaines[id].audioCtx.createMediaStreamSource(stream);
                tabsGaines[id].nodeGain = tabsGaines[id].audioCtx.createGain();
                tabsGaines[id].source.connect(tabsGaines[id].nodeGain);
                tabsGaines[id].nodeGain.connect(tabsGaines[id].audioCtx.destination);
                tabsGaines[id].nodeGain.gain.setTargetAtTime(tabsLevels[id], 0, 0.1);
                try{
                    callback();
                }catch(e){ }

            });
    },
    deInit: function(id) {
        tabsGaines[id].streamer.getAudioTracks().forEach(function(track) {
            track.stop();
        });
        Object.prototype.hasOwnProperty.call(tabsGaines, id) && tabsGaines[id].audioCtx.close()
            .then(function() {
                delete tabsGaines[id];
                delete tabsLevels[id];
            });
    },
    getTab: function(id) {
        if (tabsLevels.hasOwnProperty(id))
            return true;
        return false;
    },
    isMuted: function(callback) {
        return chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
            if (chrome.runtime.lastError) {
                callback(false)
            }else{
                callback(tabs[0].mutedInfo.muted)
            }
        })
    },
    toMute: function(e) {
        chrome.tabs.query({}, function(tabs) {
            for (var i = 0; i < tabs.length; i++) {
                chrome.tabs.update(tabs[i].id, {
                    "muted": e
                });
            }
        });
    },
    volume: function(id, val) {
        tabsLevels[id] = parseFloat(val) / 100;
        tabsGaines[id].nodeGain.gain.setTargetAtTime(tabsLevels[id], 0, 0.1);
    }
}




chrome.commands.onCommand.addListener(function(command) {
    // chrome.windows.update(null, { state: "fullscreen" });
    if (!hotkeysType[parseInt(command[command.length - 1]) - 1])
        return;
    if (command.indexOf("toggle-up") != -1)
        mainClicker(1)
    if (command.indexOf("toggle-down") != -1)
        mainClicker(-1)
});


var stated;
chrome.tabCapture.onStatusChanged.addListener(function(info) {

    if (info.fullscreen) {
        if (!prevFullScreen) {
            chrome.windows.getCurrent(function(win) {
                stated = win.state;
                if (fscreen)
                    chrome.windows.update(win.id, { state: "fullscreen" });
            })
        }
    }else{
        chrome.windows.getCurrent(function(win) {
            if (fscreen)
                chrome.windows.update(win.id, { state: stated });
        })
    }
    prevFullScreen = info.fullscreen;

});

chrome.tabs.onCreated.addListener(function(e){
    if (muteAll)
        chrome.tabs.update(e.id, {
            "muted": !0
        });
});

chrome.extension.onConnect.addListener(function(port) {
    // tabsGaines[tabArray[0].id].nodeGain.gain.value = parseFloat(gainLevels[tabsLevels[tabArray[0].id]]);

    port.onMessage.addListener(function(e) {
        a.getTab(e.id) ? a.volume(e.id, e.val) : a.init(e.id, e.val);
    });
    // if (true) {}
    chrome.tabs.query({ currentWindow: true, active: true }, function(tabArray) {
        if (tabArray[0].audible && !a.getTab(tabArray[0].id)){
            a.isMuted(function(isMuted){
                a.init(tabArray[0].id, isMuted?0:100, function(){
                    port.postMessage({ tabsLevels: tabsLevels, curTab: tabArray[0] });
                })
            })
        }else{
            port.postMessage({ tabsLevels: tabsLevels, curTab: tabArray[0] });
        }
    })
})


chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
    if(request.how == 'get')
        chrome.storage.sync.get(request.what, function(items) {
            sendResponse(items)
        });
    if(request.how == 'set')
        chrome.storage.sync.set(request.what, function(){
            hotkeysType = request.what.hotkeysType;
            fscreen = request.what.fscreen;
            muteAll = request.what.muteAll;
            a.toMute(muteAll);
            sendResponse(true);
        });
    return true;
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.how == 'popup'){
        _gaq.push(['_trackEvent', 'popup', request.what]);
    }
    if(request.how == 'promotion'){
        _gaq.push(['_trackEvent', 'promotion', request.what]);
    }
})







var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-76335181-13']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
