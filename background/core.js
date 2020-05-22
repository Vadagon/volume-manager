                // chrome-extension://jcjiagpgoplifgcdkpdefncbbpdjdean/popup.html
// IN-TAB VOLUME INDICATOR handler
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



// SHORTCUTS HANDLER
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

// AUDIO MAIN CORE FUNCTIONS
var a = {
    init: function(id, val, callback) {
        if (Object.keys(tabsGaines).length < 6)
            chrome.tabCapture.capture({
                audio: !0,
                video: !1
            }, function(stream) {
                tabsLevels[id] = parseFloat(val) / 100;
                tabsGaines[id] = {};


                // createAudio(tabsGaines[id], stream);
                // setDefaults(tabsGaines[id]);

             

                // tabsGaines[id].nodeGain.gain.value = tabsGaines[id].nodeGain.gain.value;

                // a.eqi(id, {})

                // connect(tabsGaines[id]);


                a.createAudio(tabsGaines[id], tabsLevels[id], stream)
                
                callback&&callback()
            });
    },
    createAudio: function(currentTab, tabLevel, stream){
        currentTab.audioCtx = new window.AudioContext;
        currentTab.stream = stream;
        currentTab.streamOutput = currentTab.audioCtx.createMediaStreamSource(currentTab.stream);
        currentTab.nodeGain = currentTab.audioCtx.createGain();
        currentTab.streamOutput.connect(currentTab.nodeGain);
        currentTab.nodeGain.connect(currentTab.audioCtx.destination);
        currentTab.nodeGain.gain.setTargetAtTime(tabLevel, 0, 0.1);

        a.createAnalyzer(currentTab)
    },
    createAnalyzer: function(currentTab){
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
    },
    visuInit: function(id, port){
            if(!id){
                chrome.tabs.query({ windowType: 'normal', audible: true }, function(tabArray) {
                    tabArray.forEach((e, n)=>{
                        if(tabsGaines.hasOwnProperty(e.id))
                            id = e.id;
                    })
                    a.visuInit(id, port)
                });
                return;
            }
            a.createAnalyzer(tabsGaines[id])

            function draw() {
                if(!tabsGaines[id] || !tabsGaines[id].analyser) clearInterval(intw);
                tabsGaines[id].analyser.getByteFrequencyData(tabsGaines[id].dataArray);
                port.postMessage({
                    type: 'visualizer',
                    data: tabsGaines[id].dataArray,
                    bufferLength: tabsGaines[id].bufferLength
                });
            };

            var intw = setInterval(draw, 100 / 3);
            port.onDisconnect.addListener(()=>{
                console.log('disconnected')
                tabsGaines[id].streamOutput.disconnect(tabsGaines[id].analyser);
                tabsGaines[id].analyser = null
                clearInterval(intw);
            })
    },
    equalizer: function(id, val) {
        // id = 3289;
        console.log(val)
        var eqiparams = ['twenty', 'fifty', 'oneHundred', 'twoHundred', 'fiveHundred', 'oneThousand', 'twoThousand', 'fiveThousand', 'tenThousand', 'twentyThousand']
        // tabsLevels[id] = parseFloat(val) / 100;
        // tabsGaines[id].nodeGain.gain.setTargetAtTime(tabsLevels[id], 0, 0.1);
        // tabsGaines[id].nodeGain.gain.value = tabsLevels[id]
        // connect(tabsGaines[id]);
        val.forEach((e, n)=>{
            tabsGaines[id][eqiparams[n]].gain.value = e.value
            tabsGaines[id].equalizer[n] = e.value;
        })
        // connect(tabsGaines[id])

        // tabsGaines[id].twenty.gain.value = obj.twenty;
        // tabsGaines[id].fifty.gain.value = obj.fifty;
        // tabsGaines[id].oneHundred.gain.value = obj.oneHundred;
        // tabsGaines[id].twoHundred.gain.value = obj.twoHundred;
        // tabsGaines[id].fiveHundred.gain.value = obj.fiveHundred;
        // tabsGaines[id].oneThousand.gain.value = obj.oneThousand;
        // tabsGaines[id].twoThousand.gain.value = obj.twoThousand;
        // tabsGaines[id].fiveThousand.gain.value = obj.fiveThousand;
        // tabsGaines[id].tenThousand.gain.value = obj.tenThousand;
        // tabsGaines[id].twentyThousand.gain.value = obj.twentyThousand;
    }
}




var PRO = {
    isEnabled: false,
    enable: function(){
        a.createAudio = PRO.createAudio;
        PRO.isEnabled = true;
        chrome.storage.sync.set({isPRO: PRO.isEnabled})
    },
  createAudio: function(currentTab, tabLevel, b) {
    currentTab.stream = b;
    currentTab.audioCtx = new AudioContext;
    b = new Tuna(currentTab.audioCtx);

    currentTab.leftGain = currentTab.audioCtx.createGain();
    currentTab.rightGain = currentTab.audioCtx.createGain();
    currentTab.monoGain = currentTab.audioCtx.createGain();
    currentTab.splitter = currentTab.audioCtx.createChannelSplitter(2);
    currentTab.merger = currentTab.audioCtx.createChannelMerger(2);
    currentTab.streamOutput = currentTab.audioCtx.createMediaStreamSource(currentTab.stream);
    currentTab.nodeGain = currentTab.audioCtx.createGain();
    currentTab.compressor = currentTab.audioCtx.createDynamicsCompressor();
    currentTab.twenty = currentTab.audioCtx.createBiquadFilter();
    currentTab.fifty = currentTab.audioCtx.createBiquadFilter();
    currentTab.oneHundred = currentTab.audioCtx.createBiquadFilter();
    currentTab.twoHundred = currentTab.audioCtx.createBiquadFilter();
    currentTab.fiveHundred = currentTab.audioCtx.createBiquadFilter();
    currentTab.oneThousand = currentTab.audioCtx.createBiquadFilter();
    currentTab.twoThousand = currentTab.audioCtx.createBiquadFilter();
    currentTab.fiveThousand = currentTab.audioCtx.createBiquadFilter();
    currentTab.tenThousand = currentTab.audioCtx.createBiquadFilter();
    currentTab.twentyThousand = currentTab.audioCtx.createBiquadFilter();
    currentTab.panner = currentTab.audioCtx.createStereoPanner()

    currentTab.equalizer = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]



    // currentTab.analyser = currentTab.audioCtx.createAnalyser();
    // currentTab.streamOutput.connect(currentTab.analyser);

    // // currentTab.analyser.connect(currentTab.audioCtx.destination);
    // // currentTab.analyser.fftSize = 1024;
    // currentTab.bufferLength = currentTab.analyser.frequencyBinCount;
    // currentTab.dataArray = new Uint8Array(currentTab.bufferLength);



    PRO.setDefaults(currentTab);
    PRO.connect(currentTab);

    a.createAnalyzer(currentTab)
  },
  setDefaults: function(currentTab) {
    currentTab.twenty.type = "lowshelf";
    currentTab.fifty.type = "peaking";
    currentTab.oneHundred.type = "peaking";
    currentTab.twoHundred.type = "peaking";
    currentTab.fiveHundred.type = "peaking";
    currentTab.oneThousand.type = "peaking";
    currentTab.twoThousand.type = "peaking";
    currentTab.fiveThousand.type = "peaking";
    currentTab.tenThousand.type = "peaking";
    currentTab.twentyThousand.type = "highshelf";
    currentTab.twenty.frequency.value = 32;
    currentTab.fifty.frequency.value = 64;
    currentTab.fifty.Q.value = 5;
    currentTab.oneHundred.frequency.value = 125;
    currentTab.oneHundred.Q.value = 5;
    currentTab.twoHundred.frequency.value = 250;
    currentTab.twoHundred.Q.value = 5;
    currentTab.fiveHundred.frequency.value = 500;
    currentTab.fiveHundred.Q.value = 5;
    currentTab.oneThousand.frequency.value = 1E3;
    currentTab.oneHundred.Q.value = 5;
    currentTab.twoThousand.frequency.value = 2E3;
    currentTab.twoThousand.Q.value = 5;
    currentTab.fiveThousand.frequency.value = 4E3;
    currentTab.fiveThousand.Q.value = 5;
    currentTab.tenThousand.frequency.value = 8E3;
    currentTab.tenThousand.Q.value = 5;
    currentTab.twentyThousand.frequency.value = 16E3;
    currentTab.compressor.threshold.value = 0;
    currentTab.compressor.attack.value = 0;
    currentTab.compressor.release.value = .2;
    currentTab.compressor.ratio.value = 20;
    currentTab.compressor.knee.value = 0;
    currentTab.nodeGain.gain.value = 1;
    currentTab.monoGain.gain.value = .6;
    currentTab.panner.pan.value = 0
  },
  connect: function(currentTab) {
    currentTab.streamOutput.connect(currentTab.twenty);

    currentTab.twenty.connect(currentTab.fifty);
    currentTab.fifty.connect(currentTab.oneHundred);
    currentTab.oneHundred.connect(currentTab.twoHundred);
    currentTab.twoHundred.connect(currentTab.fiveHundred);
    currentTab.fiveHundred.connect(currentTab.oneThousand);
    currentTab.oneThousand.connect(currentTab.twoThousand);
    currentTab.twoThousand.connect(currentTab.fiveThousand);
    currentTab.fiveThousand.connect(currentTab.tenThousand);
    currentTab.tenThousand.connect(currentTab.twentyThousand);
    currentTab.twentyThousand.connect(currentTab.compressor);
    currentTab.compressor.connect(currentTab.nodeGain);

    currentTab.nodeGain.connect(currentTab.panner);
    currentTab.panner.connect(currentTab.audioCtx.destination);
  }
}
// PRO.enable()
