var hotkeysType = [true, false];
// chrome.storage.sync.set({ "gainLevels" : gainLevels, "hotkeysType" : hotkeysType });

var a = {
	dataUpdate: function(){
		chrome.storage.sync.set({ "hotkeysType" : hotkeysType }, function(){
			chrome.runtime.sendMessage({"hotkeysType" : hotkeysType}, function(response) {
			   Materialize.toast('Updated!', 4000);
			});
		});
	},
	toogleTypeStyle: function(el){
		if (el.find('input').prop('checked')) {
			el.find('input').removeAttr('checked');
			el.find('label').text('Disabled')
		}else{
			el.find('input').attr('checked', '');
			el.find('label').text('Enabled')
		}
		el.toggleClass( "blue-grey" );
		el.find('div:eq(0)').toggleClass( "white-text" );
	},
	toogleType: function(){
		hotkeysType[$( ".toogleType" ).index($(this))] = !hotkeysType[$( ".toogleType" ).index($(this))];
		a.toogleTypeStyle($(this));
		a.dataUpdate();
	},
	init: function(){
		if (!hotkeysType[0])
			a.toogleTypeStyle($('.toogleType:eq(0)'));
		if (hotkeysType[1])
			a.toogleTypeStyle($('.toogleType:eq(1)'));
	}

};


$(document).ready(function(){
	chrome.storage.sync.get(["hotkeysType"], function(items) {
		
		if (!chrome.runtime.error)
			if(items.hasOwnProperty("hotkeysType"))
				hotkeysType = items.hotkeysType;
		
		a.init();
		$( ".toogleType" ).click(a.toogleType);


	});
});