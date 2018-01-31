var gainNode, audioCtx, streamer, 
gainLevels = {
	1: 0.2,
	2: 1,
	3: 6,
	4: 0
}, tab = {level: 4, tabGainer: undefined};



chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {

	if(msg.what=='SET'){
		tab.tabGainer = msg.gainer;
	}

	if (msg.what=='CLICKED') {
		if (!tab.tabGainer) {
			sendResponses(false);
		}else{
			tab.level == 4?tab.level = 1:tab.level++;
			sendResponses(tab);
		}
	}

});