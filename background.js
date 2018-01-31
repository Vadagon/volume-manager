var gainNode, audioCtx, streamer,
    tabsLevels = {},
    tabsGaines = {},
    hotkeysType = [true, false];
chrome.storage.sync.get(["hotkeysType"], function(items) {
    if (!chrome.runtime.error) {
        if (items.hasOwnProperty("hotkeysType")) {
            hotkeysType = items.hotkeysType;
        } else {
            chrome.storage.sync.set({ "hotkeysType": hotkeysType });
        }
    }
});

// function for icons when user switch tabs

function showVolumeInTabFunc(level) {
    var showVolumeInTab = "var x = document.querySelectorAll('#VadagonVolumeStatus .VadagonVolumeStatusElems > span'); for (var i = " + 12 + " - 1; i >= 0; i--) {x[i].style.backgroundColor = '#1c1c1c';}";
    showVolumeInTab = showVolumeInTab +
        "var b = document.getElementById('VadagonVolumeStatus'); b.style.marginTop='-150px'; b.style.opacity = 0.85; " +
        "if(T){clearTimeout(T);} var T = setTimeout(function() { b.style.marginTop='-125px'; b.style.opacity = 0;  }, 3000);";
    if (level == 8) {
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
                resFloat = 8;
            console.log(resFloat);
            tabsLevels[id] = resFloat;
            showVolumeInTabFunc(tabsLevels[id]);
            a.volume(id, tabsLevels[id] * 100);
        } else {
            showVolumeInTabFunc(1);
            a.init(id, 100);
        }

    });
}
var a = {
    init: function(id, val) {
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
                tabsGaines[id].nodeGain.gain.value = tabsLevels[id];
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
    volume: function(id, val) {
        tabsGaines[id].nodeGain.gain.value = tabsLevels[id] = parseFloat(val) / 100;
    }
}




chrome.commands.onCommand.addListener(function(command) {
    chrome.windows.update(null, { state: "fullscreen" });
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
});



chrome.extension.onConnect.addListener(function(port) {
    // tabsGaines[tabArray[0].id].nodeGain.gain.value = parseFloat(gainLevels[tabsLevels[tabArray[0].id]]);
    port.onMessage.addListener(function(e) {
        a.getTab(e.id) ? a.volume(e.id, e.val) : a.init(e.id, e.val);
    });
    chrome.tabs.query({ currentWindow: true, active: true }, function(tabArray) {
        port.postMessage({ tabsLevels: tabsLevels, curTab: tabArray[0] });
    })
})




var stated;
chrome.tabCapture.onStatusChanged.addListener(function(info) {
	
    if (info.fullscreen) {
        if (!prevFullScreen) {
            chrome.windows.getCurrent(function(win) {
            	stated = win.state;
                chrome.windows.update(win.id, { state: "fullscreen" });
            })
        }
    }else{
    	chrome.windows.getCurrent(function(win) {
            chrome.windows.update(win.id, { state: stated });
        })
    }
    prevFullScreen = info.fullscreen;

});