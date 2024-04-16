
// AUDIO MAIN CORE FUNCTIONS
var a = {
    init: function (id, val, streamId, callback) {
        console.log(111111)
        console.log(streamId);
        if (Object.keys(data.tabsGaines).length < 6 && !data.user.disabled)
            navigator.mediaDevices.getUserMedia({
                audio: {
                    mandatory: {
                        chromeMediaSource: "tab",
                        chromeMediaSourceId: streamId,
                    },
                }
            }).then(function (stream) {
                console.log(22222)
                // chrome.action.setBadgeText({ tabId: id, text: val.toString() })
                data.tabsLevels[id] = parseFloat(val) / 100;
                data.tabsGaines[id] = {};


                // createAudio(data.tabsGaines[id], stream);
                // setDefaults(data.tabsGaines[id]);



                // data.tabsGaines[id].nodeGain.gain.value = data.tabsGaines[id].nodeGain.gain.value;

                // a.eqi(id, {})

                // connect(data.tabsGaines[id]);

                if (!data.tabsGaines[id].audioCtx) a.createAudio(data.tabsGaines[id], data.tabsLevels[id], stream)

                callback && callback()
            }).catch(console.log);
    },
    createAudio: function (currentTab, tabLevel, stream) {
        currentTab.audioCtx = new window.AudioContext;
        currentTab.stream = stream;
        currentTab.streamOutput = currentTab.audioCtx.createMediaStreamSource(currentTab.stream);
        currentTab.nodeGain = currentTab.audioCtx.createGain();
        currentTab.streamOutput.connect(currentTab.nodeGain);
        currentTab.nodeGain.connect(currentTab.audioCtx.destination);
        currentTab.nodeGain.gain.setTargetAtTime(tabLevel, 0, 0.1);

        a.createAnalyzer(currentTab)
    },
    createAnalyzer: function (currentTab) {
        currentTab.analyser = currentTab.audioCtx.createAnalyser();
        currentTab.streamOutput.connect(currentTab.analyser);

        // currentTab.analyser.connect(currentTab.audioCtx.destination);
        // currentTab.analyser.fftSize = 1024;
        currentTab.bufferLength = currentTab.analyser.frequencyBinCount;
        currentTab.dataArray = new Uint8Array(currentTab.bufferLength);


        // setTimeout(function() {
        //   currentTab.streamOutput.disconnect(currentTab.analyser);
        // }, 3000);
    },
    disable: function () {
        console.log(data);
        for (var id in data.tabsGaines)
            a.deInit(id);
    },
    deInit: function (id) {
        data.tabsGaines[id].stream.getAudioTracks().forEach(function (track) {
            track.stop();
        });
        Object.prototype.hasOwnProperty.call(data.tabsGaines, id) && data.tabsGaines[id].audioCtx.close()
            .then(function () {
                delete data.tabsGaines[id];
                delete data.tabsLevels[id];
                console.log(data.tabsGaines);
            });
    },
    getTab: function (id) {
        if (data.tabsLevels.hasOwnProperty(id))
            return true;
        return false;
    },
    isMuted: function (callback) {
        return chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            if (chrome.runtime.lastError) {
                callback(false)
            } else {
                callback(tabs[0].mutedInfo.muted)
            }
        })
    },
    toMute: function (e) {
        chrome.tabs.query({}, function (tabs) {
            for (var i = 0; i < tabs.length; i++) {
                chrome.tabs.update(tabs[i].id, {
                    "muted": e
                });
            }
        });
    },
    volume: function (id, val) {
        chrome.action.setBadgeText({ tabId: id, text: val.toString() })
        data.tabsLevels[id] = parseFloat(val) / 100;
        data.tabsGaines[id].nodeGain.gain.setTargetAtTime(data.tabsLevels[id], 0, 0.1);
    },
    visualizerInitiates: 0,
    visuInit: function (id, port) {
        if (!id) {
            chrome.tabs.query({ audible: true }, function (tabArray) {
                tabArray.forEach((e, n) => {
                    if (data.tabsGaines.hasOwnProperty(e.id))
                        id = e.id;
                })
                a.visuInit(id, port)
            });
            return;
        } else if (a.visualizerInitiates) {
            // return;
            a.visualizerInitiates++;
        } else {
            a.visualizerInitiates = 0;
            a.createAnalyzer(data.tabsGaines[id])
        }

        function draw() {
            if (!data.tabsGaines[id] || !data.tabsGaines[id].analyser) clearInterval(intw);
            data.tabsGaines[id].analyser.getByteFrequencyData(data.tabsGaines[id].dataArray);
            port.postMessage({
                type: 'visualizer',
                data: data.tabsGaines[id].dataArray,
                bufferLength: data.tabsGaines[id].bufferLength
            });
        };

        var intw = setInterval(draw, 100 / 3);
        port.onDisconnect.addListener(() => {
            console.log('disconnected')
            a.visualizerInitiates--;
            if (!a.visualizerInitiates) {
                data.tabsGaines[id].streamOutput.disconnect(data.tabsGaines[id].analyser);
                data.tabsGaines[id].analyser = null
            }
            clearInterval(intw);
        })
    },
    equalizer: function (id, val) {
        // id = 3289;
        console.log(val)
        var eqiparams = ['twenty', 'fifty', 'oneHundred', 'twoHundred', 'fiveHundred', 'oneThousand', 'twoThousand', 'fiveThousand', 'tenThousand', 'twentyThousand']
        // data.tabsLevels[id] = parseFloat(val) / 100;
        // data.tabsGaines[id].nodeGain.gain.setTargetAtTime(data.tabsLevels[id], 0, 0.1);
        // data.tabsGaines[id].nodeGain.gain.value = data.tabsLevels[id]
        // connect(data.tabsGaines[id]);
        val.forEach((e, n) => {
            data.tabsGaines[id][eqiparams[n]].gain.value = e.value
            data.tabsGaines[id].equalizer[n] = e.value;
        })
        // connect(data.tabsGaines[id])

        // data.tabsGaines[id].twenty.gain.value = obj.twenty;
        // data.tabsGaines[id].fifty.gain.value = obj.fifty;
        // data.tabsGaines[id].oneHundred.gain.value = obj.oneHundred;
        // data.tabsGaines[id].twoHundred.gain.value = obj.twoHundred;
        // data.tabsGaines[id].fiveHundred.gain.value = obj.fiveHundred;
        // data.tabsGaines[id].oneThousand.gain.value = obj.oneThousand;
        // data.tabsGaines[id].twoThousand.gain.value = obj.twoThousand;
        // data.tabsGaines[id].fiveThousand.gain.value = obj.fiveThousand;
        // data.tabsGaines[id].tenThousand.gain.value = obj.tenThousand;
        // data.tabsGaines[id].twentyThousand.gain.value = obj.twentyThousand;
    }
}
