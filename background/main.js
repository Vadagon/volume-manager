// chrome-extension://jcjiagpgoplifgcdkpdefncbbpdjdean/popup.html

var gainNode, audioCtx, streamer,
    tabsLevels = {},
    tabsGaines = {},
    hotkeysType = [true, true],
    fscreen = true,
    muteAll = false;

// ON-INIT DATABASE handler
chrome.storage.sync.get(["hotkeysType", "fscreen", "muteAll", "lastDay"], function(items) {
    if (!chrome.runtime.error) {
        if (items.hasOwnProperty("hotkeysType") && items.hasOwnProperty("fscreen")) {
            hotkeysType = items.hotkeysType;
            fscreen = items.fscreen;
            muteAll = items.muteAll;
        }else{
            chrome.storage.sync.set({ "hotkeysType": hotkeysType, "fscreen": fscreen, "muteAll": muteAll });
        }
        if (!items.hasOwnProperty("lastDay")) {
            var now = new Date();
            var fullDaysSinceEpoch = Math.floor(now/8.64e7);
            chrome.storage.sync.set({ "lastDay": fullDaysSinceEpoch });
        }

    }
});


var sysOS;
chrome.runtime.getPlatformInfo(function(info){
    sysOS = info.os;
})

var prevWindow;





// GOOGLE ANALYSTICS
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-131310674-3']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();











// var currentTab = {};
var tempStream = {};
function createAudio(currentTab, b) {
    currentTab.stream = b;
    currentTab.audioCtx = new AudioContext;
    b = new Tuna(currentTab.audioCtx);
    if (Core.load('chorusBypass') === false) {
        currentTab.chorus = new b.Chorus();
    }
    if (Core.load('convolverBypass') === false) {
        currentTab.convolver = new b.Convolver
    }
    if (Core.load('pitchBypass') != true) {
        currentTab.pitch = new Jungle(currentTab.audioCtx);
    }



    



    currentTab.leftGain = currentTab.audioCtx.createGain();
    currentTab.rightGain = currentTab.audioCtx.createGain();
    currentTab.monoGain = currentTab.audioCtx.createGain();
    currentTab.splitter = currentTab.audioCtx.createChannelSplitter(2);
    currentTab.merger = currentTab.audioCtx.createChannelMerger(2);
    currentTab.streamOutput = currentTab.audioCtx.createMediaStreamSource(currentTab.stream);
    currentTab.gainNode = currentTab.audioCtx.createGain();
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

    currentTab.analyser = currentTab.audioCtx.createAnalyser();
    currentTab.streamOutput.connect(currentTab.analyser);

    // currentTab.analyser.connect(currentTab.audioCtx.destination);
    // currentTab.analyser.fftSize = 1024;
    currentTab.bufferLength = currentTab.analyser.frequencyBinCount;
    currentTab.dataArray = new Uint8Array(currentTab.bufferLength);

    setTimeout(function() {
        // currentTab.streamOutput.disconnect(currentTab.analyser);
    }, 3000);

}
function setDefaults(currentTab) {
        currentTab.twenty.type = "lowshelf";
        if (Core.load('pitchBypass') != true) {
            currentTab.pitch.value = 0;
            currentTab.pitch.setPitchOffset(0)
        }
        if (Core.load('chorusBypass') != true) {
            currentTab.chorus.delay = 0;
            currentTab.chorus.feedback = 0;
            currentTab.chorus.rate = 0;
            currentTab.chorus.depth = .7;
            currentTab.chorus.bypass = 0;
        }
        if (Core.load('convolverBypass') != true) {
            currentTab.convolver.wetLevel.value = 0;
            currentTab.convolver.dryLevel.value = 1;
            currentTab.convolver.highCut.value = 22050;
            currentTab.convolver.lowCut.value = 20;
            currentTab.convolver.bypass = 0;
        }
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
        currentTab.gainNode.gain.value = 1;
        currentTab.monoGain.gain.value = .6;
        currentTab.panner.pan.value = Core.load('pan') || 0
    }
function connect(currentTab) {
        if (Core.load('pitchBypass') != true && Core.load('chorusBypass') != true && Core.load('convolverBypass') != true) {
            currentTab.streamOutput.connect(currentTab.pitch);
            currentTab.pitch.output.connect(currentTab.chorus);
            currentTab.chorus.connect(currentTab.convolver);
            currentTab.convolver.connect(currentTab.twenty)
        } else if (Core.load('pitchBypass') == true && Core.load('chorusBypass') != true && Core.load('convolverBypass') != true) {
            currentTab.streamOutput.connect(currentTab.chorus);
            currentTab.chorus.connect(currentTab.convolver);
            currentTab.convolver.connect(currentTab.twenty)
        } else if (Core.load('pitchBypass') != true && Core.load('chorusBypass') && Core.load('convolverBypass') != true) {
            currentTab.streamOutput.connect(currentTab.pitch);
            currentTab.pitch.output.connect(currentTab.convolver);
            currentTab.convolver.connect(currentTab.twenty)
        } else if (Core.load('pitchBypass') != true && Core.load('chorusBypass') != true && Core.load('convolverBypass') == true) {
            currentTab.streamOutput.connect(currentTab.pitch);
            currentTab.pitch.output.connect(currentTab.chorus);
            currentTab.chorus.connect(currentTab.twenty);
        } else if (Core.load('pitchBypass') != true && Core.load('chorusBypass') == true && Core.load('convolverBypass') === true) {
            currentTab.streamOutput.connect(currentTab.pitch);
            currentTab.pitch.output.connect(currentTab.twenty);
        } else if (Core.load('pitchBypass') == true && Core.load('chorusBypass') === true && Core.load('convolverBypass') != true) {
            currentTab.streamOutput.connect(currentTab.convolver);
            currentTab.convolver.connect(currentTab.twenty);
        } else if (Core.load('pitchBypass') == true && Core.load('chorusBypass') != true && Core.load('convolverBypass') === true) {
            currentTab.streamOutput.connect(currentTab.chorus);
            currentTab.chorus.connect(currentTab.twenty);
        } else if (Core.load('pitchBypass') === true && Core.load('chorusBypass') == true && Core.load('convolverBypass') == true) {
            currentTab.streamOutput.connect(currentTab.twenty);
        }
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
        currentTab.compressor.connect(currentTab.gainNode);
        // if (Core.load('mono') === true) {
        //     this.toggleMonoNodes(true);
        //     this.sendAnalyserStream()
        // } else {
            currentTab.gainNode.connect(currentTab.panner);
            currentTab.panner.connect(currentTab.audioCtx.destination);
        // }
    }
function sendAnalyserStream() {
        // let b = currentTab.audioCtx.createMediaStreamDestination();
        // currentTab.panner.connect(b);
        // currentTab.destinationStream = b.stream;
        // chrome.runtime.sendMessage({
        //     type: "analyserModule",
        //     "property": b.stream
        // });
    }












/**
 *  @author - exttoolscmp
 */
class Utils {
    load(key) {
        let data = window.localStorage[key];
        if (typeof data === "undefined") {
            return null;
        }
        try {
            return JSON.parse(data);
        } catch (e) {
            return data;
        }
    }
    save(key, data) {
        window.localStorage[key] = JSON.stringify(data);
        return true;
    }
    getUserID() {
        let uid = this.load('uid');
        if (uid) {
            return uid;
        } else {
            let buf = new Uint32Array(4),
                idx = -1;
            window.crypto.getRandomValues(buf);
            uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                idx++;
                let r = (buf[idx >> 3] >> ((idx % 8) * 4)) & 15,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            }.bind(this));
            this.save('uid', uid);
            return uid;
        }
    }
    _get(key, callback) {
        chrome.storage.sync.get(key, callback)
    }
    _set(data) {
        chrome.storage.sync.set(data);
    }
    sendMessage(key, val) {
        chrome.runtime.sendMessage({
            type: key,
            value: val
        })
    }
    setIcon(a) {
        chrome.browserAction.setIcon({
            path: "/assets/icons/" + a + ".png"
        })
    }
}
var Core = new Utils();
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") {
        Core.save('tabEqualizer', true);
        chrome.storage.local.set({
            userId: Core.getUserID(),
            dateInstalled: (new Date())
                .getTime(),
            tabEqualizer: true,
            mono: false,
            instance: false,
            power: false,
            pitch: false,
            info: true,
            tabLimiter: false,
            convolverBypass: true,
        });
    } else if (details.reason == "update") {
        chrome.storage.local.set({
            dateUpdate: (new Date())
                .getTime()
        })
    }
});


function InitStorage() {
        Core.save('instance', false);
        Core.save('power', false);
        if (Core.load('mono') != true) {
            Core.save('mono', false);
        }
        if (Core.load('pitch') != true) {
            Core.save('pitch', false);
        }
        if (Core.load('convolverBypass') == null) {
            Core.save('convolverBypass', true)
        }
        if (Core.load('pitchBypass') == null) {
            Core.save('pitchBypass', true)
        }
        if (Core.load('chorusBypass') == null) {
            Core.save('chorusBypass', true)
        }
        if (Core.load('tabLimiter') == null) {
            Core.save('tabLimiter', true)
        }
        if (Core.load('autoOpen') != true) {
            Core.save('autoOpen', false);
        }
        if (Core.load('info') == null) {
            Core.save('info', true)
        }
        if (Core.load('volumePreset') == null) {
            Core.save('volumePreset', true)
        }
        if (Core.load('autoLoadPreset') == null) {
            Core.save('autoLoadPreset', true)
        }
    }

InitStorage()
