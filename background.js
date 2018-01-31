var gainNode, audioCtx, streamer, 
gainLevels = {
	1: 0,
	2: 0.2,
	3: 0.4,
	4: 0.6,
	5: 0.8,
	6: 1,
	7: 8

}, tabsLevels = {}, tabsGaines = {}, hotkeysType = [true, false];
chrome.storage.sync.get(["gainLevels", "hotkeysType"], function(items) {
	if (!chrome.runtime.error) {
		if(items.hasOwnProperty("gainLevels") && items.hasOwnProperty("hotkeysType")){
			gainLevels = items.gainLevels;
			hotkeysType = items.hotkeysType;
		}else{
			chrome.storage.sync.set({ "gainLevels" : gainLevels, "hotkeysType" : hotkeysType });
		}
	}
});
chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        mySuperCallback(tab.url);
    });
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, updatedTab) {
    chrome.tabs.query({'active': true}, function (activeTabs) {
        var activeTab = activeTabs[0];

        if (activeTab == updatedTab) {
            mySuperCallback(activeTab.url);
        }
    });
});

// Код на всякий случай, если нужно будет изменять уровни звука относительно ОСи
// chrome.runtime.getPlatformInfo(function(info) {
//     // Display host OS in the console
//     console.log(info.os);
//     os = info.os;
// });


// function for icons when user switch tabs
function mySuperCallback(newUrl) {
	chrome.tabs.query({ currentWindow: true, active: true }, function (tabArray) {
		// chrome.browserAction.setIcon({path: icon});
		if(tabsLevels.hasOwnProperty(tabArray[0].id)){
			if(0.7 < gainLevels[tabsLevels[tabArray[0].id]] && 1 >= gainLevels[tabsLevels[tabArray[0].id]]) {
			    chrome.browserAction.setIcon({path: 'images/lvl3.png'});
			}else if(0.2 < gainLevels[tabsLevels[tabArray[0].id]] && 0.7 >= gainLevels[tabsLevels[tabArray[0].id]]){
				chrome.browserAction.setIcon({path: 'images/lvl2.png'});
			}else if(0 <= gainLevels[tabsLevels[tabArray[0].id]] && 0.2 >= gainLevels[tabsLevels[tabArray[0].id]]){
				chrome.browserAction.setIcon({path: 'images/lvl1.png'});
			}else if(gainLevels[tabsLevels[tabArray[0].id]] > 1){
				chrome.browserAction.setIcon({path: 'images/lvl4.png'});
			}
		}

		if(!tabsLevels.hasOwnProperty(tabArray[0].id))
		    chrome.browserAction.setIcon({path: 'images/off.png'});
	});
}
function showVolumeInTabFunc(level){
	var showVolumeInTab = "var x = document.querySelectorAll('#VadagonVolumeStatus .VadagonVolumeStatusElems > span'); for (var i = "+12+" - 1; i >= 0; i--) {x[i].style.backgroundColor = '#1c1c1c';}";
	showVolumeInTab = showVolumeInTab + 
		"var b = document.getElementById('VadagonVolumeStatus'); b.style.marginTop='-150px'; b.style.opacity = 0.85; " +
		"if(T){clearTimeout(T);} var T = setTimeout(function() { b.style.marginTop='-125px'; b.style.opacity = 0;  }, 3000);";
	if(level == 8){
		showVolumeInTab = showVolumeInTab + "for (var i = "+10+" - 1; i >= 0; i--) {x[i].style.backgroundColor = 'white';} x[10].style.backgroundColor = '#ff613f'; x[11].style.backgroundColor = '#ff613f';";
	}else{
		showVolumeInTab = showVolumeInTab + "for (var i = "+level*10+" - 1; i >= 0; i--) {x[i].style.backgroundColor = 'white';}";
	}



	chrome.tabs.executeScript(null, {code: showVolumeInTab}, function(){

	})
}
chrome.tabs.onRemoved.addListener((a) => {
    Object.prototype.hasOwnProperty.call(tabsGaines, a) && tabsGaines[a].audioCtx.close()
        .then(() => {
            delete tabsLevels[a];
			delete tabsGaines[a];
        })
});
function mainClicker(e){
	chrome.tabs.query({ currentWindow: true, active: true }, function (tabArray) {
		if(tabsLevels.hasOwnProperty(tabArray[0].id)) {
			if (e==='up')
				tabsLevels[tabArray[0].id] == Object.keys(gainLevels).length?tabsLevels[tabArray[0].id] = 1:tabsLevels[tabArray[0].id]++;

			if (e==='down')
				tabsLevels[tabArray[0].id] == 1?tabsLevels[tabArray[0].id] = Object.keys(gainLevels).length:tabsLevels[tabArray[0].id]--;

			showVolumeInTabFunc(gainLevels[tabsLevels[tabArray[0].id]]);
			
			if(tabsGaines[tabArray[0].id] == 'normalMode'){
				chrome.tabCapture.capture({
				    audio: true,
				    video: false
				}, function(stream) {
					tabsGaines[tabArray[0].id] = {};
					tabsGaines[tabArray[0].id].audioCtx = new window.AudioContext;
					tabsGaines[tabArray[0].id].streamer = stream;
			        tabsGaines[tabArray[0].id].source = tabsGaines[tabArray[0].id].audioCtx.createMediaStreamSource(stream);
			        tabsGaines[tabArray[0].id].nodeGain = tabsGaines[tabArray[0].id].audioCtx.createGain();
			        tabsGaines[tabArray[0].id].source.connect(tabsGaines[tabArray[0].id].nodeGain);
			        tabsGaines[tabArray[0].id].nodeGain.connect(tabsGaines[tabArray[0].id].audioCtx.destination);
			        tabsGaines[tabArray[0].id].nodeGain.gain.value = parseFloat(gainLevels[tabsLevels[tabArray[0].id]]);
				});
			}else if (gainLevels[tabsLevels[tabArray[0].id]]==1) {
				tabsGaines[tabArray[0].id].streamer.getAudioTracks().forEach(function(track) {
		            track.stop();
		        });
				Object.prototype.hasOwnProperty.call(tabsGaines, tabArray[0].id) && tabsGaines[tabArray[0].id].audioCtx.close()
		        .then(() => {
					tabsGaines[tabArray[0].id] = 'normalMode';
		        })
		    }else{
				tabsGaines[tabArray[0].id].nodeGain.gain.value = parseFloat(gainLevels[tabsLevels[tabArray[0].id]]);
		    }

		}else{
			chrome.tabCapture.capture({
			    audio: true,
			    video: false
			}, function(stream) {
				showVolumeInTabFunc(gainLevels[1])
				tabsLevels[tabArray[0].id] = 1;
				tabsGaines[tabArray[0].id] = {};
				tabsGaines[tabArray[0].id].audioCtx = new window.AudioContext;
				tabsGaines[tabArray[0].id].streamer = stream;
		        tabsGaines[tabArray[0].id].source = tabsGaines[tabArray[0].id].audioCtx.createMediaStreamSource(stream);
		        tabsGaines[tabArray[0].id].nodeGain = tabsGaines[tabArray[0].id].audioCtx.createGain();
		        tabsGaines[tabArray[0].id].source.connect(tabsGaines[tabArray[0].id].nodeGain);
		        tabsGaines[tabArray[0].id].nodeGain.connect(tabsGaines[tabArray[0].id].audioCtx.destination);
		        tabsGaines[tabArray[0].id].nodeGain.gain.value = parseFloat(gainLevels[tabsLevels[tabArray[0].id]]);
				mySuperCallback();
			});

		}
		mySuperCallback();

	}); 
}
















chrome.browserAction.onClicked.addListener(function(tab) {
	mainClicker('up')
});
chrome.commands.onCommand.addListener(function (command) {
	if (!hotkeysType[parseInt(command[command.length -1])-1])
		return;
	if (command.indexOf("toggle-up")!=-1)
    	mainClicker('up')
    if (command.indexOf("toggle-down")!=-1)
    	mainClicker('down')
});



chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log(request);
	gainLevels = request.gainLevels;
	hotkeysType = request.hotkeysType;
});