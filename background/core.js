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
        tabsLevels[id] = parseFloat(val) / 100;
        if (Object.keys(tabsGaines).length < 6)
            chrome.tabCapture.capture({
                audio: !0,
                video: !1
            }, function(stream) {
                tabsGaines[id] = {};


                createAudio(tabsGaines[id], stream);
                setDefaults(tabsGaines[id]);

             

                // tabsGaines[id].gainNode.gain.value = tabsGaines[id].gainNode.gain.value;

                // a.eqi(id, {})

                connect(tabsGaines[id]);



                // tabsGaines[id] = {};
                // tabsGaines[id].audioCtx = new window.AudioContext;
                // tabsGaines[id].streamer = stream;
                // tabsGaines[id].source = tabsGaines[id].audioCtx.createMediaStreamSource(stream);
                // tabsGaines[id].nodeGain = tabsGaines[id].audioCtx.createGain();
                // tabsGaines[id].source.connect(tabsGaines[id].nodeGain);
                // tabsGaines[id].nodeGain.connect(tabsGaines[id].audioCtx.destination);
                // tabsGaines[id].nodeGain.gain.setTargetAtTime(tabsLevels[id], 0, 0.1);
                callback&&callback()
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
        // tabsGaines[id].nodeGain.gain.setTargetAtTime(tabsLevels[id], 0, 0.1);
        tabsGaines[id].gainNode.gain.value = tabsLevels[id]
        // connect(tabsGaines[id]);
    },
    eqi: function(id, obj){
        
    },
    visuInit: function(id, port){
            // setTimeout(function() {
            //     // var media = tabsGaines[id];
            //     var media = tabsGaines[3289];
            //     var win = chrome.extension.getViews({})[1]
            //     console.log(media, win)
            //     if(media && win) new Visualizer().ini(media, win);
            // }, 2000);

            function draw() {
                // chrome-extension://jcjiagpgoplifgcdkpdefncbbpdjdean/popup.html

                // console.log(port)
                tabsGaines[id].analyser.getByteFrequencyData(tabsGaines[id].dataArray);
                // tabsGaines[id].analyser.getByteTimeDomainData(tabsGaines[id].dataArray);
                port.postMessage({
                    type: 'visualizer',
                    data: tabsGaines[id].dataArray,
                    bufferLength: tabsGaines[id].bufferLength
                });
                // console.log(2)
            };
            port.onDisconnect.addListener(()=>{
                clearInterval(intw);
            })
            var intw = setInterval(function() {
                draw()
            }, 1000 / 30);
    },
    equalizer: function(id, val) {
        // id = 3289;
        console.log(val)
        var eqiparams = ['twenty', 'fifty', 'oneHundred', 'twoHundred', 'fiveHundred', 'oneThousand', 'twoThousand', 'fiveThousand', 'tenThousand', 'twentyThousand']
        // tabsLevels[id] = parseFloat(val) / 100;
        // tabsGaines[id].nodeGain.gain.setTargetAtTime(tabsLevels[id], 0, 0.1);
        // tabsGaines[id].gainNode.gain.value = tabsLevels[id]
        // connect(tabsGaines[id]);
        val.forEach((e, n)=>{
            tabsGaines[id][eqiparams[n]].gain.value = e.value
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
