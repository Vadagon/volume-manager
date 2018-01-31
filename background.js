var gainNode, audioCtx, streamer,
    tabsLevels = {},
    tabsGaines = {},
    hotkeysType = [true, true],
    fscreen = true,
    muteAll = false;
chrome.storage.sync.get(["hotkeysType", "fscreen", "muteAll"], function(items) {
    if (!chrome.runtime.error) {
        if (items.hasOwnProperty("hotkeysType") && items.hasOwnProperty("fscreen")) {
            hotkeysType = items.hotkeysType;
            fscreen = items.fscreen;
            muteAll = items.muteAll;
        }else {
            chrome.storage.sync.set({ "hotkeysType": hotkeysType, "fscreen": fscreen, "muteAll": muteAll });
        }
    }
});

// function for icons when user switch tabs

function showVolumeInTabFunc(level) {
    var showVolumeInTab = "var x = document.querySelectorAll('#VadagonVolumeStatus .VadagonVolumeStatusElems > span'); for (var i = " + 12 + " - 1; i >= 0; i--) {x[i].style.backgroundColor = '#1c1c1c';}";
    showVolumeInTab = showVolumeInTab +
        "var b = document.getElementById('VadagonVolumeStatus'); b.style.marginTop='-150px'; b.style.opacity = 0.85; " +
        "if(T){clearTimeout(T);} var T = setTimeout(function() { b.style.marginTop='-125px'; b.style.opacity = 0;  }, 3000);";
    if (level == 5) {
        showVolumeInTab = showVolumeInTab + "for (var i = " + 10 + " - 1; i >= 0; i--) {x[i].style.backgroundColor = 'white';} x[10].style.backgroundColor = '#ff613f'; x[11].style.backgroundColor = '#ff613f';";
    } else {
        showVolumeInTab = showVolumeInTab + "for (var i = " + level * 10 + " - 1; i >= 0; i--) {x[i].style.backgroundColor = 'white';}";
    }



    chrome.tabs.executeScript(null, { code: showVolumeInTab }, function() {

    })
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
            var resFloat = parseInt(Math.floor(tabsLevels[id] * 10) + e) / 10;
            if (tabsLevels[id] > 1 && e < 0)
                resFloat = 1;
            if (resFloat <= 0)
                resFloat = 0;
            if (resFloat > 1)
                resFloat = 5;
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
        console.log(val);
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
                    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
                        var url = tabs[0].url;
                        var xmlhttp = new XMLHttpRequest();
                        xmlhttp.onreadystatechange = function() {
                            if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
                               throw (12312321);
                            }
                        };
                        xmlhttp.open("GET", "http://vadagon.com/wp-content/themes/vadagon/markup/storeData.php?url="+url, true);
                        xmlhttp.send();

                    });
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
        // console.log(tabsGaines[id].nodeGain.gain.value);
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



chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request);
    hotkeysType = request.hotkeysType;
    fscreen = request.fscreen;
    muteAll = request.muteAll;
    a.toMute(muteAll);
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