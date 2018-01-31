var tabsLevels = {};

var port = chrome.extension.connect({
	name: "Sample Communication"
});
function changeVolume(id, val){
	port.postMessage({id: parseInt(id), val: val});
}
 // port.postMessage("Hi BackGround");
port.onMessage.addListener(function(msg) {
      tabsLevels = msg.tabsLevels;
      console.log(tabsLevels);
      $('#curContoller').attr('tabID', msg.curTab.id);
      $('#curContoller [type="range"]').val(tabsLevels[msg.curTab.id]>1?100:tabsLevels[msg.curTab.id]*100);
      if (tabsLevels[msg.curTab.id]>1){
      	$('#curContoller [type="checkbox"]').attr('checked', true); 
      	$('#curContoller [type="range"]').attr('disabled', true);
      }
chrome.tabs.query({audible: !0}, function(tabs){
	var aTabs = '';
	for (var i = tabs.length - 1; i >= 0; i--) {
		if(tabsLevels.hasOwnProperty(tabs[i].id)){
			// tabsLevels[tabs[i].id] = {volume: 100, boost: false};
			if (tabsLevels[tabs[i].id]>1) {
				var voll = 800;
				var boost = 'checked=""';
				var volDis = 'disabled=""';
			}else{
				var voll = tabsLevels[tabs[i].id]*100;
				var boost = '';
				var volDis = '';
			}
			aTabs = aTabs + '<tr id="'+tabs[i].id+'">'+
				'<td class="switchTab"><img src="'+tabs[i].favIconUrl+'"></td>'+
				'<td class="showControllers">'+
					'<p class="range-field">'+
						'<span class="tabName switchTab">'+tabs[i].title+'</span>'+
						'<input type="range" value="'+voll+'" '+volDis+' min="0" max="100" />'+
					'</p>'+
				'</td>'+
				'<td>'+
					'<input type="checkbox" '+boost+' id="boost'+i+'" />'+
					'<label for="boost'+i+'"></label>'+
				'</td>'+
			'</tr>';
		}else{
			aTabs = aTabs + '<tr id="'+tabs[i].id+'">'+
				'<td class="switchTab switchTab"><img src="'+tabs[i].favIconUrl+'"></td>'+
				'<td colspan="2">'+
					'<p class="range-field switchTab">'+
						'<span class="tabName">'+tabs[i].title+'</span>'+
						'<b>Click to switch the tab</b>'+
					'</p>'+
				'</td>'+
			'</tr>';
		}
	}
	if (aTabs) {
		$('.actived > tbody *').remove();
		$('.actived > tbody').append(aTabs);
	}
	$('.switchTab').click(function(){
		console.log('switch the tab');
		chrome.tabs.update(parseInt($(this).closest('tr')[0].id), {active: true});
	})
	$('.options').click(function(){
		chrome.runtime.openOptionsPage() ;
	})
	$('input[type="checkbox"]').change(function(){
		if (this.id!="curBoost") {
			var checkboxId = $(this).parent().parent()[0].id;
		}else{
			var checkboxId = msg.curTab.id;
		}
		if(this.checked){
			tabsLevels[checkboxId] = $('#'+checkboxId+' input[type="range"], [tabID="'+checkboxId+'"] input[type="range"]').val();
			$('#'+checkboxId+' input[type="range"], [tabID="'+checkboxId+'"] input[type="range"]').val(100);
			$('#'+checkboxId+' input[type="range"], [tabID="'+checkboxId+'"] input[type="range"]').attr('disabled', true);
			$('#'+checkboxId+' input[type="checkbox"], [tabID="'+checkboxId+'"] input[type="checkbox"]').attr('checked', "true");
			changeVolume(checkboxId, 800);
		}else{
			// console.log(tabsLevels[checkboxId]);
			$('#'+checkboxId+' input[type="range"], [tabID="'+checkboxId+'"] input[type="range"]').val(tabsLevels[checkboxId]);
			$('#'+checkboxId+' input[type="range"], [tabID="'+checkboxId+'"] input[type="range"]').attr('disabled', false);
			$('#'+checkboxId+' input[type="checkbox"], [tabID="'+checkboxId+'"] input[type="checkbox"]').removeAttr('checked');
			changeVolume(checkboxId, tabsLevels[checkboxId]);
		}
	});
	$(document).on('input', 'input[type="range"]', function() {
		if (this.id!="currVolume") {
			var tr = $(this).parent().parent().parent();
			tabsLevels[tr[0].id] = $(this).val();
			changeVolume(tr[0].id, $(this).val());
			if (tr[0].id == msg.curTab.id)
				$('#currVolume').val($(this).val())
		}else{
			changeVolume(msg.curTab.id, $(this).val());
			$('#'+msg.curTab.id+' input[type="range"]').val($(this).val())
		}
	});





	var hhhtml = '<h6 class="footer">'+
				 	'Can you spend few seconds to <a href="https://goo.gl/c4TMmx" target="_blank">Rate <i class="material-icons">star_rate</i>my work</a> ?'+
				 '</h6>';
	if(Math.random() < 0.07)
		$('body').append(hhhtml);

});
});