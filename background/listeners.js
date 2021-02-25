// TABS REMOVER listener - to purge memory
chrome.tabs.onRemoved.addListener(function(a) {
    Object.prototype.hasOwnProperty.call(tabsGaines, a) && tabsGaines[a].audioCtx.close()
        .then(function() {
            delete tabsLevels[a];
            delete tabsGaines[a];
        })
});


// CHROME SHORTCUTS
chrome.commands.onCommand.addListener(function(command) {
    // chrome.windows.update(null, { state: "fullscreen" });
    if (!hotkeysType[parseInt(command[command.length - 1]) - 1])
        return;
    if (command.indexOf("toggle-up") != -1)
        mainClicker(1)
    if (command.indexOf("toggle-down") != -1)
        mainClicker(-1)
});


// AUDIO CAPTURE CHANGES listener
chrome.tabCapture.onStatusChanged.addListener(function(info) {
    console.log(info)

    if(sysOS == 'mac' && info.fullscreen){
        chrome.windows.getCurrent(function(win){
            prevWindow = win;
            console.log(win)
            chrome.tabs.query({active: true}, function(tab){
                prevWindow.tabIndex = tab[0].index;
                chrome.windows.create({
                    type: "popup",
                    state: "maximized",
                    tabId: info.tabId
                }, function(e){
                    console.log(e)
                    chrome.windows.update(e.id, { state: "fullscreen" });
                });
            })

        })
    }else if (info.fullscreen && sysOS != 'mac') {
        if (!prevFullScreen) {
            chrome.windows.getCurrent(function(win) {
                prevWindow = win;
                if (fscreen)
                    chrome.windows.update(win.id, { state: "fullscreen" });
            })
        }
    }else if(sysOS != 'mac' && prevWindow){
        chrome.windows.getCurrent(function(win) {
            if (fscreen)
                chrome.windows.update(win.id, { state: prevWindow.state });
        })
    }else if(sysOS == 'mac' && prevWindow){
        chrome.tabs.move(info.tabId, {windowId: prevWindow.id, index: prevWindow.tabIndex}, ()=>{
            chrome.tabs.update(info.tabId, {active: true, highlighted: true})
        });
    }

    prevFullScreen = info.fullscreen;

});


// NEW TABS listener - to mute if needed
chrome.tabs.onCreated.addListener(function(e){
    if (muteAll)
        chrome.tabs.update(e.id, {
            "muted": !0
        });
});


// POPUP PORT CONNECTION listener
chrome.runtime.onConnect.addListener(function(port) {
    // tabsGaines[tabArray[0].id].nodeGain.gain.value = parseFloat(gainLevels[tabsLevels[tabArray[0].id]]);

    port.onMessage.addListener(function(e) {
        if(e.type=='equalizer') a.equalizer(e.id, e.val);
        else if(e.type=='visualizer') return;
        else a.getTab(e.id) ? a.volume(e.id, e.val) : a.init(e.id, e.val);
    });
    // if (true) {}
    // currentWindow: true
    chrome.tabs.query({ windowType: 'normal', active: true }, function(tabArray) {
        if (tabArray[0].audible && !a.getTab(tabArray[0].id)){
            // a.isMuted(function(isMuted){
            a.init(tabArray[0].id, 100, function(){
                port.postMessage({ tabsLevels: tabsLevels, curTab: tabArray[0] });
                a.visuInit(tabArray[0].audible?tabArray[0].id:false, port)
            })
            // })
        }else{
            port.postMessage({ tabsLevels: tabsLevels, curTab: tabArray[0] });
            a.visuInit(tabArray[0].audible?tabArray[0].id:false, port); 
            if(a.getTab(tabArray[0].id)) port.postMessage({ type: 'equalizerSettings', data: tabsGaines[tabArray[0].id].equalizer });
        }
    })
    port.postMessage({ email: PRO.userid, isPRO: PRO.isEnabled, darkMode: darkMode });
})


// EXTERNAL OPTIONS PAGE CONNECTED listener
// chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
//     if(request.how == 'get')
//         chrome.storage.sync.get(request.what, function(items) {
//             sendResponse(items)
//         });
//     if(request.how == 'set')
//         chrome.storage.sync.set(request.what, function(){
//             hotkeysType = request.what.hotkeysType;
//             fscreen = request.what.fscreen;
//             muteAll = request.what.muteAll;
//             a.toMute(muteAll);
//             sendResponse(true);
//         });
//     return true;
// });


// SIMPLE POPUP MESSAGES listener
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.how == 'popup'){
        _gaq.push(['_trackEvent', 'popup', request.what]);
    }
    if(request.how == 'promotion'){
        _gaq.push(['_trackEvent', 'promotion', request.what]);
    }
    if(request.how == 'stats'){
        _gaq.push(['_trackEvent', 'stats', request.what]);
    }
    if(request.how == 'PRO' && request.data){
        console.log(request)
        PRO.enable()
    }
    if(request.how == 'darkMode'){
        darkMode = request.data;
        chrome.storage.sync.set({darkMode: darkMode})
    }
})