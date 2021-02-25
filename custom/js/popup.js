// chrome-extension://jcjiagpgoplifgcdkpdefncbbpdjdean/popup.html

chrome.runtime.sendMessage({how: "popup", what: 'window appeared to user'});

var fileImage = 'data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDU4IDU4IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1OCA1ODsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI1MTJweCIgaGVpZ2h0PSI1MTJweCI+Cjxwb2x5Z29uIHN0eWxlPSJmaWxsOiNFREVBREE7IiBwb2ludHM9IjUxLjUsMTQgMzcuNSwwIDYuNSwwIDYuNSw1OCA1MS41LDU4ICIvPgo8Zz4KCTxwYXRoIHN0eWxlPSJmaWxsOiNDRUM5QUU7IiBkPSJNMTYuNSwyM2gyNWMwLjU1MiwwLDEtMC40NDcsMS0xcy0wLjQ0OC0xLTEtMWgtMjVjLTAuNTUyLDAtMSwwLjQ0Ny0xLDFTMTUuOTQ4LDIzLDE2LjUsMjN6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojQ0VDOUFFOyIgZD0iTTE2LjUsMTVoMTBjMC41NTIsMCwxLTAuNDQ3LDEtMXMtMC40NDgtMS0xLTFoLTEwYy0wLjU1MiwwLTEsMC40NDctMSwxUzE1Ljk0OCwxNSwxNi41LDE1eiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6I0NFQzlBRTsiIGQ9Ik00MS41LDI5aC0yNWMtMC41NTIsMC0xLDAuNDQ3LTEsMXMwLjQ0OCwxLDEsMWgyNWMwLjU1MiwwLDEtMC40NDcsMS0xUzQyLjA1MiwyOSw0MS41LDI5eiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6I0NFQzlBRTsiIGQ9Ik00MS41LDM3aC0yNWMtMC41NTIsMC0xLDAuNDQ3LTEsMXMwLjQ0OCwxLDEsMWgyNWMwLjU1MiwwLDEtMC40NDcsMS0xUzQyLjA1MiwzNyw0MS41LDM3eiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6I0NFQzlBRTsiIGQ9Ik00MS41LDQ1aC0yNWMtMC41NTIsMC0xLDAuNDQ3LTEsMXMwLjQ0OCwxLDEsMWgyNWMwLjU1MiwwLDEtMC40NDcsMS0xUzQyLjA1Miw0NSw0MS41LDQ1eiIvPgo8L2c+Cjxwb2x5Z29uIHN0eWxlPSJmaWxsOiNDRUM5QUU7IiBwb2ludHM9IjM3LjUsMCAzNy41LDE0IDUxLjUsMTQgIi8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo='

var tabsLevels = {};


angular.module('main', ['ngMaterial'])
.controller('AppCtrl', function($scope, $mdDialog, $rootScope) {
	$scope.Math = Math;
	$scope.addNumberEnable = 1;
	if(Math.random() > 0.5) $scope.addNumberEnable = 2;
	
	$scope.darkMode = false;
	$scope.isPRO = false;
	$rootScope.email;
	function changeVolume(id, val){
		port.postMessage({id: parseInt(id), val: val});
	}
	$scope.showAlert = function(ev) {
	    if(!$scope.isPRO) {
	    	$mdDialog.show({
	    		controller: PaymentController,
		        clickOutsideToClose:true,
		        templateUrl: 'payment.tmpl.html',
				parent: angular.element(document.body),
				targetEvent: ev
		    })
	    	chrome.runtime.sendMessage({how: "promotion", what: 'Interested in the PRO equalizer'});
	    }else {
	    	$scope.showEqualizer = !$scope.showEqualizer;
			chrome.runtime.sendMessage({how: "popup", what: 'Equalizer open/close'});
	    }
	};
	function PaymentController($scope, $mdDialog) {
		$scope.email = $rootScope.email
	}
	$scope.currentLevel = 100;
	$scope.noizeTabs = [];
	$scope.controlledTabs = [];
	$scope.currentFavIconUrl = '';
	$scope.shows = false;
	$scope.filePNG = fileImage;
	$scope.promote1 = !1;
	$scope.equalizer = [
		{name: '32', value: 0},
		{name: '64', value: 0},
		{name: '125', value: 0},
		{name: '250', value: 0},
		{name: '500', value: 0},
		{name: '1k', value: 0},
		{name: '2k', value: 0},
		{name: '4k', value: 0},
		{name: '8k', value: 0},
		{name: '16k', value: 0}
	]
	$scope.presetsEqualzers = {
        "Acoustic": [15, 15, 10, 4, 7, 7, 10, 12, 10, 5],
        "Bass Booster": [15, 12, 10, 7, 3, 0, 0, 0, 0, 0],
        "Bass Reducer": [15, 12, 10, 8, -5, -5, 0, 7, 10, 12],
        "Classical": [15, 12, 10, 8, -5, -5, 0, 7, 10, 12],
        "Dance": [12, 22, 15, 0, 5, 10, 16, 15, 12, 0],
        "Deep": [15, 12, 5, 3, 10, 8, 5, -6, -12, -15],
        "Electronic": [14, 13, 4, 0, -6, 6, 3, 4, 13, 15],
        "Hiphop": [16, 14, 4, 10, -4, -3, 4, -2, 6, 10],
        "Jazz": [13, 10, 4, 6, -5, -5, 0, 4, 10, 13],
        "Latin": [9, 5, 0, 0, -5, -5, -5, 0, 10, 15],
        "Loudness": [20, 14, 0, 0, -6, 0, -2, -18, 16, 3],
        "Lounge": [-10, -5, -2, 4, 13, 4, 0, -5, 6, 3],
        "Piano": [10, 6, 0, 9, 10, 5, 11, 15, 10, 11],
        "Pop": [-5, -4, 0, 6, 15, 13, 6, 0, -3, -5],
        "R&B": [9, 23, 19, 4, -8, -5, 8, 9, 10, 12],
        "Rock": [16, 13, 10, 4, -1, -2, 1, 8, 11, 15],
        "Small Speakers": [18, 14, 13, 8, 4, 0, -4, -9, -11, -14],
        "Spoken Word": [-7, -1, 0, 2, 12, 15, 16, 14, 8, 0],
        "Treble Booster": [0, 0, 0, 0, 0, 3, 8, 12, 14, 17],
        "Treble Reducer": [0, 0, 0, 0, 0, -3, -8, -12, -14, -17],
        "Vocal Booster": [-5, -10, -10, 4, 12, 12, 10, 5, 0, -5],
        "None": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
    $scope.presetEqualizer = function(data){
    	if(!data) return;

    	$scope.equalizer.forEach((e, n)=>{
    		e.value = data[n]
    	})
    	$scope.changing.equalizer()
    	// console.log($scope.equalizer)
    	// $scope.$apply()
    }
	// <option id="acoustic" value="acoustic" data-i18n="preset_acoustic" datatype="i18n">Acoustic</option>
	// <option id="bassBooster" value="bassBooster" data-i18n="preset_bassBooster" datatype="i18n">Bass Booster</option>
	// <option id="bassReducer" value="bassReducer" data-i18n="preset_bassReducer" datatype="i18n">Bass Reducer</option>
	// <option id="classical" value="classical" data-i18n="preset_classical" datatype="i18n">Classical</option>
	// <option id="dance" value="dance" data-i18n="preset_dance" datatype="i18n">Dance</option>
	// <option id="deep" value="deep" data-i18n="preset_deep" datatype="i18n">Deep</option>
	// <option id="electronic" value="electronic" data-i18n="preset_electronic" datatype="i18n">Electronic</option>
	// <option id="hiphop" value="hiphop" data-i18n="preset_hiphop" datatype="i18n">Hip-Hop</option>
	// <option id="jazz" value="jazz" data-i18n="preset_jazz" datatype="i18n">Jazz</option>
	// <option id="latin" value="latin" data-i18n="preset_latin" datatype="i18n">Latin</option>
	// <option id="loudness" value="loudness" data-i18n="preset_loudness" datatype="i18n">Loudness</option>
	// <option id="lounge" value="lounge" data-i18n="preset_lounge" datatype="i18n">Lounge</option>
	// <option id="piano" value="piano" data-i18n="preset_piano" datatype="i18n">Piano</option>
	// <option id="pop" value="pop" data-i18n="preset_pop" datatype="i18n">Pop</option>
	// <option id="rnb" value="rnb" data-i18n="preset_rnb" datatype="i18n">R&amp;B</option>
	// <option id="rock" value="rock" data-i18n="preset_rock" datatype="i18n">Rock</option>
	// <option id="smallSpeakers" value="smallSpeakers" data-i18n="preset_smallSpeakers" datatype="i18n">Small Speakers</option>
	// <option id="spokenWord" value="spokenWord" data-i18n="preset_spokenWord" datatype="i18n">Spoken Word</option>
	// <option id="trebleBooster" value="trebleBooster" data-i18n="preset_trebleBooster" datatype="i18n">Treble Booster</option>
	// <option id="trebleReducer" value="trebleReducer" data-i18n="preset_trebleReducer" datatype="i18n">Treble Reducer</option>
	// <option id="vocalBooster" value="vocalBooster" data-i18n="preset_vocalBooster" datatype="i18n">Vocal Booster</option>

	$scope.promote1Show = function(e){
		if(e){
			$scope.promote1 = !0;
			chrome.runtime.sendMessage({how: "promotion", what: 'Interested in the promote 1'});
		}else{
			$scope.promote1 = !1;
			chrome.runtime.sendMessage({how: "promotion", what: 'Close the promote 1'});
		}
	}
	$scope.promote1Redirect = function(){
		chrome.runtime.sendMessage({how: "promotion", what: 'Redirected to the promote 1'});
		setTimeout(function () {
			chrome.tabs.create({url: 'https://bit.ly/3dDVTVN', active: !0, selected: !0});
		}, 10);
	}


	chrome.tabs.query({ currentWindow: true, active: true }, function(tabArray) {
		$scope.currentFavIconUrl = tabArray[0].favIconUrl;
	});

	var port = chrome.runtime.connect({
		name: "Sample Communication"
	});


	// canvas1 = document.getElementById('visualizer1');
	// canvasCtx = canvas1.getContext("2d");
	// var WIDTH = canvas1.width;
	// var HEIGHT = canvas1.height;



	canvas = document.getElementById('visualizer');
	
	var animationId,
            cwidth = canvas.width,
            cheight = canvas.height - 2,
            gap = 2, //gap between meters
            capHeight = 2,
            capStyle = $scope.darkMode?'#515151':'#969696',
            gap = 1.2,
            meterNum = 21, //count of the meters
            meterWidth = cwidth/meterNum/gap, //width of the meters in the spectrum
            capYPositionArray = [], ////store the vertical position of hte caps for the preivous frame
        	ctx = canvas.getContext('2d');
        gradient = ctx.createLinearGradient(0, 0, 0, cheight);
        gradient.addColorStop(1, $scope.darkMode?'#333':'#ececec');

        $scope.recolorVisualizer = function(){
        	chrome.runtime.sendMessage({how: "darkMode", data: $scope.darkMode});
        	capStyle = $scope.darkMode?'#515151':'#969696';
	        gradient = ctx.createLinearGradient(0, 0, 0, cheight);
	        gradient.addColorStop(1, $scope.darkMode?'#333':'#ececec');
        }



        // chrome-extension://jcjiagpgoplifgcdkpdefncbbpdjdean/popup.html
	port.onMessage.addListener(function(msg) {
		// console.log(msg)
		if(msg.type=='visualizer'){
	        var step = Math.round(msg.bufferLength / meterNum);
	        ctx.clearRect(0, 0, cwidth, cheight);
	        for (var i = 0; i < meterNum; i++) {
	            var value = msg.data[i * step]/255*cheight/gap;
	            if (capYPositionArray.length < Math.round(meterNum)) {
	                capYPositionArray.push(value);
	            };
	            ctx.fillStyle = capStyle;
	            if (value < capYPositionArray[i]) {
	                ctx.fillRect(i * meterWidth * gap, cheight - (--capYPositionArray[i]), meterWidth, capHeight);
	            } else {
	                ctx.fillRect(i * meterWidth * gap, cheight - value, meterWidth, capHeight);
	                capYPositionArray[i] = value;
	            };
	            ctx.fillStyle = gradient;
	            ctx.fillRect(i * meterWidth * gap, cheight - value + capHeight, meterWidth, cheight*5);
	        }

			// port.postMessage(msg);
			return;
		}
		if(msg.type=='equalizerSettings'){
			// console.log(msg)
			$scope.presetEqualizer(msg.data)
			return;
		}
		if(msg.email){
			$rootScope.email = msg.email
			$scope.isPRO = msg.isPRO
			$scope.darkMode = !!msg.darkMode;
			$scope.recolorVisualizer()
			isPRO(msg.email, e=>{
				chrome.runtime.sendMessage({how: "PRO", data: e});
			})
		}

		tabsLevels = msg.tabsLevels;
		if (msg.curTab && tabsLevels[msg.curTab.id])
			if (tabsLevels[msg.curTab.id]>1){
				$scope.isDisabledCurrent = true;
			}
		if (msg.curTab && tabsLevels[msg.curTab.id])
			$scope.currentLevel = tabsLevels[msg.curTab.id]*100;




		$scope.$apply();

		$scope.changing = {};
		$scope.changing.currentLevel = function (){
			changeVolume(msg.curTab.id, $scope.currentLevel);
			// if($scope.controlledTabs.find(function(el){ el.id == msg.curTab.id ? return true; }))
				$scope.controlledTabs.find(function(el){ el.id == msg.curTab.id ? el.volumeLevel = $scope.currentLevel:false })
		}
		$scope.changing.controlledTabs = function(id, val){
			changeVolume(id, val);
			if(id == msg.curTab.id)
				$scope.currentLevel = val;
		}
		$scope.changing.equalizer = function (){
			port.postMessage({id: parseInt(msg.curTab.id), val: angular.copy($scope.equalizer), type: 'equalizer'});
		}
		$scope.redirect = function(id){
			if(id == 'options'){
				chrome.runtime.openOptionsPage();
			}else if(id == 'shortcuts'){
				chrome.runtime.sendMessage({how: "stats", what: 'shortcuts'});
				chrome.tabs.create({url: 'chrome://extensions/shortcuts', active: !0, selected: !0});
			}else if(id == 'review'){
				chrome.runtime.sendMessage({how: "stats", what: 'review'});
				chrome.tabs.create({url: 'https://chrome.google.com/webstore/detail/volume-manager/abnhonfioiokelhdappjknfaannlncac/reviews', active: !0, selected: !0})
			}else if(id == 'add1'){
				chrome.runtime.sendMessage({how: "promotion", what: 'Redirected to Smart Unfriender'});
				chrome.tabs.create({url: 'https://bit.ly/3ceYEy4', active: !0, selected: !0})
			}else{
				chrome.tabs.update(id, {active: true});
			}
		}
		// $scope.test = 1111;
		// $scope.$apply();	
		if(msg.tabsLevels)
			chrome.tabs.query({audible: !0}, function(tabs){
				for (var i = tabs.length - 1; i >= 0; i--) {
					tabs[i].favIconUrl = tabs[i].favIconUrl;
					tabs[i].tabName = tabs[i].title;
					if(tabsLevels.hasOwnProperty(tabs[i].id)){
						tabs[i].volumeLevel = tabsLevels[tabs[i].id]*100;
						$scope.controlledTabs.push(tabs[i]);

						if (tabs[i].id === msg.curTab.id)
							$scope.currentLevel = tabs[i].volumeLevel;
					}else{
						tabs[i].volumeLevel = 100;
						$scope.noizeTabs.push(tabs[i]);
					}
					$scope.$apply();
				}
	    		
				chrome.runtime.sendMessage({how: "popup", what: 'Tabs count: ' + ($scope.noizeTabs.length + $scope.controlledTabs.length)});
				chrome.storage.sync.get(["lastDay"], function(items) {
					var now = new Date();
					var fullDaysSinceEpoch = Math.floor(now/8.64e7);
				    if (!chrome.runtime.error) {
				        if (items.hasOwnProperty("lastDay"))
				            if (items.lastDay - fullDaysSinceEpoch > -8){
				            	$scope.shows = true;
				            	$scope.$apply();
				            }
				    }
				});
			});

		// $scope.showAlert();

	});
});










function isPRO(email, cb){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'https://node.verblike.com/volume-manager/isVolumePROuser/'+email);
	xhr.onload = function() {
		cb(xhr.status==200)
	};
	xhr.send();
}