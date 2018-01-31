var gainLevels = {
	1: 0.1,
	2: 0.6,
	3: 1,
	4: 8
},
hotkeysType = [true, false];
// chrome.storage.sync.set({ "gainLevels" : gainLevels, "hotkeysType" : hotkeysType });

var a = {
	dataUpdate: function(){
		var levelsNow = {};
		$("#todo-list li").each(function(){
			levelsNow[Object.keys(levelsNow).length+1] = parseFloat($(this).attr('content'));
		});
		gainLevels = levelsNow;
		console.log(gainLevels, hotkeysType);
		a.listUpdate();
		chrome.storage.sync.set({ "gainLevels" : gainLevels, "hotkeysType" : hotkeysType }, function(){
			chrome.runtime.sendMessage({"gainLevels" : gainLevels, "hotkeysType" : hotkeysType}, function(response) {
			   Materialize.toast('Updated!', 4000);
			});
		});
	},
	listUpdate: function(){
		$("#todo-list li").remove();
		for(var i in gainLevels){
			var isBoost = gainLevels[i]==8?"100% + boost":gainLevels[i]*100+"%";
			$("#todo-list").append("<li class='collection-item' content='" + gainLevels[i] + "'><a href='#!' class='secondary-content todo-item-swap' style='float: left; position: relative; left: -8px;'><i class='material-icons'>swap_vert</i></a>" + isBoost + "<a href='#!' class='secondary-content todo-item-delete'><i class='material-icons' style='color: #e42472;'>delete</i></a></li>");
		}
	},
	addTodoItem: function(x){
		console.log(x);
		gainLevels[Object.keys(gainLevels).length+1] = parseFloat(x);
		console.log(gainLevels);
		a.listUpdate();
		a.dataUpdate();
	  // $("#todo-list").append("<li class='collection-item' content='" + x + "'>" + e + "<a href='#!' class='secondary-content todo-item-delete'><i class='material-icons'>delete</i></a></li>");
	},
	deleteTodoItem: function(e, item){
		e.preventDefault();
		$(item).parent().fadeOut('slow', function() { 
			$(item).parent().remove();
			a.dataUpdate();
		});
	},
	swapTodoItem: function(e, item){
		e.preventDefault();
		var clone = $(item).parent().clone();
		var index = $( "#todo-list > li" ).index( $(item).parent() );
		$(item).parent().remove();
		$( clone ).insertBefore( "#todo-list > li:eq("+(index-1)+")" );
		a.dataUpdate();
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

	$('select').material_select();
	// Materialize.fadeInImage( 'body' );

chrome.storage.sync.get(["gainLevels", "hotkeysType"], function(items) {
	if (!chrome.runtime.error)
		if(items.hasOwnProperty("gainLevels") && items.hasOwnProperty("hotkeysType")){
			gainLevels = items.gainLevels;
			hotkeysType = items.hotkeysType;
		}	
	

	a.listUpdate();

	$( ".toogleType" ).click(a.toogleType);
	a.init();


	$( "#levelValues" ).change(function() {
		a.addTodoItem($(this).val());
		setTimeout(function(e) {
			$( e ).val("w8");
			$('select').material_select();
		}, 600, $(this));

	});



	$("#todo-list").on('click', '.todo-item-delete', function(e){
		var item = this; 
		a.deleteTodoItem(e, item)
	})

	$("#todo-list").on('click', '.todo-item-swap', function(e){
		var item = this; 
		a.swapTodoItem(e, item)
	})



});
});