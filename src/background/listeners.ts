// TABS REMOVER listener - to purge memory
import data from "./globals";
import {mainClicker, a} from './core';


chrome.tabs.onRemoved.addListener(function(a) {
    Object.prototype.hasOwnProperty.call(data.tabsGaines, a) && data.tabsGaines[a].audioCtx.close()
        .then(function() {
            delete data.tabsLevels[a];
            delete data.tabsGaines[a];
        })
});


// CHROME SHORTCUTS
chrome.commands.onCommand.addListener(function(command) {
    if (command.indexOf("toggle-up") != -1)
        mainClicker(1)
    if (command.indexOf("toggle-down") != -1)
        mainClicker(-1)
});


// AUDIO CAPTURE CHANGES listener
chrome.tabCapture.onStatusChanged.addListener(function(info) {
    if(!data.user.fullscreen) return;
    if(chrome.runtime.lastError) return;

    console.log(data.user.fullscreen)
    if(data.OS == 'mac' && info.fullscreen){
        chrome.windows.getCurrent(function(win){
            data.prevWindow = win;
            console.log(win)
            chrome.tabs.query({currentWindow: true, active: true}, function(tab){
                data.prevWindow.tabIndex = tab[0].index;
                if(!data.user.fullscreen)
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
    }else if (info.fullscreen && data.OS != 'mac') {
        if (!data.prevFullScreen) {
            chrome.windows.getCurrent(function(win) {
                data.prevWindow = win;
                if (data.user.fullscreen)
                    chrome.windows.update(win.id, { state: "fullscreen" });
            })
        }
    }else if(data.OS != 'mac' && data.prevWindow){
        chrome.windows.getCurrent(function(win) {
            if (data.user.fullscreen)
                chrome.windows.update(win.id, { state: data.prevWindow.state });
        })
    }else if(data.OS == 'mac' && data.prevWindow){
        if(!data.user.fullscreen)
            chrome.tabs.move(info.tabId, {windowId: data.prevWindow.id, index: data.prevWindow.tabIndex}, ()=>{
                chrome.tabs.update(info.tabId, {active: true, highlighted: true})
            });
    }

    data.prevFullScreen = info.fullscreen;

});


// NEW TABS listener - to mute if needed
chrome.tabs.onCreated.addListener(function(e){
    if (data.user.muteall)
        chrome.tabs.update(e.id, {
            "muted": !0
        });
});


// POPUP PORT CONNECTION listener
chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(e) {
        if(e.type=='equalizer') a.equalizer(e.id, e.val);
        else if(e.type=='visualizer') return;
        else if(!data.user.disabled) a.getTab(e.id) ? a.volume(e.id, e.val) : a.init(e.id, e.val);
    });
    // chrome.tabs.query({ currentWindow: true, active: true }, function(tabArray) {
    chrome.tabs.query({ active: true }, function(tabArray) {
        console.log(tabArray)
        if (tabArray[0] && tabArray[0].audible && !a.getTab(tabArray[0].id)){
            // a.isMuted(function(isMuted){
            a.init(tabArray[0].id, 100, function(){
                console.log('port.postMessage');
                data.currentTab = tabArray[0];
                port.postMessage({ tabsLevels: data.tabsLevels, curTab: tabArray[0], OS: data.OS });
                // a.visuInit(tabArray[0].audible?tabArray[0].id:false, port)
            })
            // })
        }else{
            console.log('port.postMessage');

            port.postMessage({ tabsLevels: data.tabsLevels, curTab: tabArray[0], OS: data.OS });
            // a.visuInit(tabArray[0].audible?tabArray[0].id:false, port); 
            if(a.getTab(tabArray[0].id)) port.postMessage({ type: 'equalizerSettings', data: data.tabsGaines[tabArray[0].id].equalizer });
        }
    })
})

// SIMPLE POPUP MESSAGES listener
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.how == 'popup'){
        data._gaq.push(['_trackEvent', 'popup', request.what]);
    }
    if(request.how == 'stats'){
        data._gaq.push(['_trackEvent', 'stats', request.what]);
    }
    if(request.endpoint == 'settings'){
        data.user[request.how] = request.data;
        chrome.storage.sync.set({users: data.user});
        if(request.how == 'disabled') request.data?a.disable():a.init(data.currentTab.id, 100);
        if(request.how == 'muteall') a.toMute(request.data);

        console.log(data.user)
    }
})