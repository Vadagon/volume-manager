var data = {
    user: {
        uid: getRandomToken(),
        firstDayInited: fullDaysSinceEpoch(),
        fullscreen: true,
        darkmode: false,
        disabled: false,
        muteall: false,
    },
    OS: null,
    prevFullScreen: null,
    currentTab: null,
    prevWindow: null,
    gainNode: null,
    audioCtx: null,
    streamer: null,
    tabsLevels: {},
    tabsStreams: {}
};
var tabsGaines = {};
var tabsStreams = {};

// SIMPLE POPUP MESSAGES listener
chrome.runtime.onMessage.addListener(async function (
    request,
    sender,
    sendResponse
) {
    console.log('onmessage offscreen', request.type, request);
    if (request.type == 'data') {
        console.log('datadatadatadatadatadata')
        sendResponse(data);
    } else if (request.type == 'volume' && request.streamId) {
        console.log('navigator.mediaDevice initttts')

        tabsStreams[request.tabId] = await navigator.mediaDevices.getUserMedia({
            video: !1,
            audio: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    chromeMediaSourceId: request.streamId,
                },
            }
        });
        data.tabsLevels[request.tabId] = request.val;
        tabsGaines[request.tabId] = {};
        createAudio(request.tabId, tabsStreams[request.tabId])
        console.log('navigator.mediaDevices')
    } else if (request.type == 'volume') {
        console.log('request.type volumeeeepspd', request.val)
        if (!tabsGaines[request.tabId]) return;
        data.tabsLevels[request.tabId] = request.val;
        tabsGaines[request.tabId].nodeGain.gain.setTargetAtTime(data.tabsLevels[request.tabId], 0, 0.1);
    }
})

const createAudio = function (tabId, stream) {
    var tabGain = tabsGaines[tabId];
    tabGain.audioCtx = new window.AudioContext;
    tabGain.stream = stream;
    tabGain.streamOutput = tabGain.audioCtx.createMediaStreamSource(tabGain.stream);
    tabGain.nodeGain = tabGain.audioCtx.createGain();
    tabGain.streamOutput.connect(tabGain.nodeGain);
    tabGain.nodeGain.connect(tabGain.audioCtx.destination);
    tabGain.nodeGain.gain.setTargetAtTime(1, 0, 0.1);
};