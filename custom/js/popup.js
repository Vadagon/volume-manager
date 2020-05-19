chrome.runtime.sendMessage({how: "popup", what: 'window appeared to user'});

var fileImage = 'data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDU4IDU4IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1OCA1ODsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI1MTJweCIgaGVpZ2h0PSI1MTJweCI+Cjxwb2x5Z29uIHN0eWxlPSJmaWxsOiNFREVBREE7IiBwb2ludHM9IjUxLjUsMTQgMzcuNSwwIDYuNSwwIDYuNSw1OCA1MS41LDU4ICIvPgo8Zz4KCTxwYXRoIHN0eWxlPSJmaWxsOiNDRUM5QUU7IiBkPSJNMTYuNSwyM2gyNWMwLjU1MiwwLDEtMC40NDcsMS0xcy0wLjQ0OC0xLTEtMWgtMjVjLTAuNTUyLDAtMSwwLjQ0Ny0xLDFTMTUuOTQ4LDIzLDE2LjUsMjN6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojQ0VDOUFFOyIgZD0iTTE2LjUsMTVoMTBjMC41NTIsMCwxLTAuNDQ3LDEtMXMtMC40NDgtMS0xLTFoLTEwYy0wLjU1MiwwLTEsMC40NDctMSwxUzE1Ljk0OCwxNSwxNi41LDE1eiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6I0NFQzlBRTsiIGQ9Ik00MS41LDI5aC0yNWMtMC41NTIsMC0xLDAuNDQ3LTEsMXMwLjQ0OCwxLDEsMWgyNWMwLjU1MiwwLDEtMC40NDcsMS0xUzQyLjA1MiwyOSw0MS41LDI5eiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6I0NFQzlBRTsiIGQ9Ik00MS41LDM3aC0yNWMtMC41NTIsMC0xLDAuNDQ3LTEsMXMwLjQ0OCwxLDEsMWgyNWMwLjU1MiwwLDEtMC40NDcsMS0xUzQyLjA1MiwzNyw0MS41LDM3eiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6I0NFQzlBRTsiIGQ9Ik00MS41LDQ1aC0yNWMtMC41NTIsMC0xLDAuNDQ3LTEsMXMwLjQ0OCwxLDEsMWgyNWMwLjU1MiwwLDEtMC40NDcsMS0xUzQyLjA1Miw0NSw0MS41LDQ1eiIvPgo8L2c+Cjxwb2x5Z29uIHN0eWxlPSJmaWxsOiNDRUM5QUU7IiBwb2ludHM9IjM3LjUsMCAzNy41LDE0IDUxLjUsMTQgIi8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo='

var tabsLevels = {};


angular.module('main', ['ngMaterial'])
.controller('AppCtrl', function($scope) {

	function changeVolume(id, val){
		port.postMessage({id: parseInt(id), val: val});
	}

	$scope.currentLevel = 100;
	$scope.noizeTabs = [];
	$scope.controlledTabs = [];
	$scope.currentFavIconUrl = '';
	$scope.shows = false;
	$scope.filePNG = fileImage;
	$scope.promote1 = !1;

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
			chrome.tabs.create({url: 'https://www.verblike.com/instafly/chrome-web-store-link/', active: !0, selected: !0});
		}, 10);
	}


	chrome.tabs.query({ currentWindow: true, active: true }, function(tabArray) {
		$scope.currentFavIconUrl = tabArray[0].favIconUrl;
	});

	var port = chrome.extension.connect({
		name: "Sample Communication"
	});


	canvas = document.getElementById('visualizer');
	canvas1 = document.getElementById('visualizer1');
	canvasCtx = canvas1.getContext("2d");


	var WIDTH = canvas1.width;
	var HEIGHT = canvas1.height;
	window.color1 = '#ececec';
	window.color2 = '#969696';
var animationId,
            cwidth = canvas.width,
            cheight = canvas.height - 2,
            gap = 2, //gap between meters
            capHeight = 2,
            capStyle = '#969696',
            gap = 1.2,
            meterNum = 21, //count of the meters
            meterWidth = cwidth/meterNum/gap, //width of the meters in the spectrum
            capYPositionArray = [], ////store the vertical position of hte caps for the preivous frame
        	ctx = canvas.getContext('2d');
        gradient = ctx.createLinearGradient(0, 0, 0, cheight);
        gradient.addColorStop(1, '#ececec');
        // gradient.addColorStop(0.5, '#202020');
        // gradient.addColorStop(0.4, '#3f51b5');


        // ctx.beginPath();
        // ctx.arc(100, 75, 50, 0, 2 * Math.PI);
        // ctx.stroke();

        // chrome-extension://jcjiagpgoplifgcdkpdefncbbpdjdean/popup.html
	port.onMessage.addListener(function(msg) {
		if(msg.type=='visualizer'){
			// console.log(msg)
		

			var dataArray = msg.data;
		    var bufferLength = msg.bufferLength;

		    canvasCtx.fillStyle = 'rgb(250, 250, 250)';
		    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
		    canvasCtx.lineWidth = 2;
		    canvasCtx.beginPath();

		    var sliceWidth = WIDTH * 1.0 / bufferLength;
		    var x = 0;

		    for (var i = 0; i < bufferLength; i++) {
		        var data = dataArray[i];
		        var v = data / 512.0;
		        var y = v * HEIGHT + HEIGHT/4;
		        var r = data + 120;
		        var g = 255 - data;
		        var b = data / 3;
		        canvasCtx.strokeStyle = 'rgb(' + r + ', ' + g + ', ' + b + ')';
		        if (i === 0) {
		            canvasCtx.moveTo(x, y);
		        } else {
		            canvasCtx.lineTo(x, y);
		        }
		        x += sliceWidth;
		    }
		    canvasCtx.lineTo(canvas1.width+20, canvas1.height / 2);
		    canvasCtx.stroke();
		 
        


        // console.log(1)

        var drawMeter = function() {
            // var array = new Uint8Array(analyser.frequencyBinCount);
            // analyser.getByteFrequencyData(array);
            // if (that.status === 0) {
            //     //fix when some sounds end the value still not back to zero
            //     for (var i = array.length - 1; i >= 0; i--) {
            //         array[i] = 0;
            //     };
            //     allCapsReachBottom = true;
            //     for (var i = capYPositionArray.length - 1; i >= 0; i--) {
            //         allCapsReachBottom = allCapsReachBottom && (capYPositionArray[i] === 0);
            //     };
            //     if (allCapsReachBottom) {
            //         cancelAnimationFrame(that.animationId); //since the sound is stoped and animation finished, stop the requestAnimation to prevent potential memory leak,THIS IS VERY IMPORTANT!
            //         return;
            //     };
            // };
            var step = Math.round(msg.bufferLength / meterNum); //sample limited data from the total array
            ctx.clearRect(0, 0, cwidth, cheight);
            for (var i = 0; i < meterNum; i++) {
                var value = msg.data[i * step]/255*cheight/gap;
                if (capYPositionArray.length < Math.round(meterNum)) {
                    capYPositionArray.push(value);
                };
                ctx.fillStyle = capStyle;
                //draw the cap, with transition effect
                if (value < capYPositionArray[i]) {
                    ctx.fillRect(i * meterWidth * gap, cheight - (--capYPositionArray[i]), meterWidth, capHeight);
                } else {
                    ctx.fillRect(i * meterWidth * gap, cheight - value, meterWidth, capHeight);
                    capYPositionArray[i] = value;
                };
                ctx.fillStyle = gradient; //set the filllStyle to gradient for a better look
                ctx.fillRect(i * meterWidth * gap/*meterWidth+gap*/ , cheight - value + capHeight, meterWidth, cheight*5); //the meter
            }
            // animationId = requestAnimationFrame(drawMeter);
        }
        drawMeter()
        // animationId = requestAnimationFrame(drawMeter);





			port.postMessage(msg);
			return;
		}


		tabsLevels = msg.tabsLevels;
		if (tabsLevels[msg.curTab.id])
			if (tabsLevels[msg.curTab.id]>1){
				$scope.isDisabledCurrent = true;
			}
		if (tabsLevels[msg.curTab.id])
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
		$scope.redirect = function(id){
			if(id == 'options'){
				chrome.runtime.openOptionsPage();
			}else if(id == 'shortcuts'){
				chrome.runtime.sendMessage({how: "stats", what: 'shortcuts'});
				chrome.tabs.create({url: 'chrome://extensions/shortcuts', active: !0, selected: !0});
			}else if(id == 'review'){
				chrome.runtime.sendMessage({how: "stats", what: 'review'});
				chrome.tabs.create({url: 'https://chrome.google.com/webstore/detail/volume-manager/abnhonfioiokelhdappjknfaannlncac/reviews', active: !0, selected: !0})
			}else{
				chrome.tabs.update(id, {active: true});
			}
		}
		// $scope.test = 1111;
		// $scope.$apply();		
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


	});
});
