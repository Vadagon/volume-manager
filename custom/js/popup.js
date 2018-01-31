var tabsLevels = {};

var port = chrome.extension.connect({
	name: "Sample Communication"
});
function changeVolume(id, val){
	port.postMessage({id: parseInt(id), val: val});
}

angular.module('main', ['ngMaterial'])

.controller('AppCtrl', function($scope) {
	$scope.currentLevel = 100;
	$scope.noizeTabs = [];
	$scope.controlledTabs = [];
	$scope.currentFavIconUrl = '';

	chrome.tabs.query({ currentWindow: true, active: true }, function(tabArray) {
		console.log(tabArray[0]);
		$scope.currentFavIconUrl = tabArray[0].favIconUrl;
	});
	port.onMessage.addListener(function(msg) {

		// console.log(msg);
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
			}else{
				chrome.tabs.update(id, {active: true});
			}
		}

		chrome.tabs.query({audible: !0}, function(tabs){
			// console.log(tabs);
			for (var i = tabs.length - 1; i >= 0; i--) {
				tabs[i].favIconUrl = tabs[i].favIconUrl;
				tabs[i].tabName = tabs[i].title;
				if(tabsLevels.hasOwnProperty(tabs[i].id)){
					tabs[i].volumeLevel = tabsLevels[tabs[i].id]*100;
					$scope.controlledTabs.push(tabs[i]);
					// console.log($scope.controlledTabs);
				}else{
					tabs[i].volumeLevel = 100;
					$scope.noizeTabs.push(tabs[i]);
				}
				$scope.$apply();
			}
		});


	});
});