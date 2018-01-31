var gainNode, audioCtx, streamer, 
gainLevels = {
	1: 0.1,
	2: 0.6,
	3: 1,
	4: 8
}, tabsLevels = {}, tabsGaines = {};
window.tabsGaines = tabsGaines;
window.tabsLevels = tabsLevels;
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
		if(tabsLevels.hasOwnProperty(tabArray[0].id))
		    chrome.browserAction.setIcon({path: 'lvl'+tabsLevels[tabArray[0].id]+'.png'});

		if(!tabsLevels.hasOwnProperty(tabArray[0].id))
		    chrome.browserAction.setIcon({path: 'off.png'});
	});
}
// chrome.tabs.onRemoved.addListener(function(tabid, removed) {
// 	if (tabsLevels.hasOwnProperty(tabid)) {
// 		tabsGaines[tabArray[0].id].audioCtx.close();
// 		delete tabsLevels[tabid];
// 		delete tabsGaines[tabid];
// 	}
// });
chrome.tabs.onRemoved.addListener((a) => {
    Object.prototype.hasOwnProperty.call(tabsGaines, a) && tabsGaines[a].audioCtx.close()
        .then(() => {
            delete tabsLevels[a];
			delete tabsGaines[a];
        })
});
function mainClicker(){
	chrome.tabs.query({ currentWindow: true, active: true }, function (tabArray) {
		if(tabsLevels.hasOwnProperty(tabArray[0].id)) {
			tabsLevels[tabArray[0].id] == 4?tabsLevels[tabArray[0].id] = 1:tabsLevels[tabArray[0].id]++;
			
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
	mainClicker()
});

chrome.commands.onCommand.addListener(function (command) {
    if (command === "toggle-volume") {
    	mainClicker()
    }
});