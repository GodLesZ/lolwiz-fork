
function LoLwizConfig() {
	this.region = "";
	this.summonername = "";
	this.left = "";
}

LoLwizConfig.prototype.init = function() {
	this.initEvents();
	var baseConfig = "{\"region\":\"\",\"summonername\":\"\",\"left\":\"\"}";

	try {
		config = localStorage.getItem("lolwizConfig");
		if (typeof(config) === "undefined" || config == null || config == 'null') {
			config = $.parseJSON(baseConfig);
		} else {
			config = $.parseJSON(config);
		}
	} catch (err) {
		config = $.parseJSON(baseConfig);
	}
	this.left = config.left;
	this.region = config.region;
	this.summonername = config.summonername;
	this.build();
};
LoLwizConfig.prototype.initEvents = function() {
	window.addEventListener('storage', function( storageEvent ){

		storageValue = JSON.parse( storageEvent.newValue );

		switch( storageEvent.key ){ 
			case 'lolwizCommandConfigToggle':
				this.toggleVisibility();
				break;

		}

	}.bind(this), false);
}

LoLwizConfig.prototype.toggleVisibility = function() {
	overwolf.windows.getCurrentWindow (function(result) {
		if (result.status == "success"){
			if(result.window.isVisible){
				overwolf.windows.minimize(result.window.id, null);
			}
			else {
				_gaq.push(['_trackPageview', 'v26/config/']);
				overwolf.windows.restore(result.window.id, null);
			}
		}
	}.bind(this));
};

LoLwizConfig.prototype.build = function() {
	var regions = [{value: "none", text: "Select Region"}, {value: "na", text: "North America"}, {value: "euw", text: "EU West"}, {value: "eune", text: "EU Nordic & East"}, {value: "tr", text: "Turkey"}, {value: "ru", text: "Russia"}, {value: "oce", text: "Oceania"}, {value: "las", text: "Latin America South"}, {value: "lan", text: "Latin America North"}, {value: "br", text: "Brasil"}];

	htmlOutput = "";
	htmlOutput += '<div class="appBorder">';
	htmlOutput += '	<div class="appBox">';
	htmlOutput += '		<div class="itemLogo"></div>';
	htmlOutput += '		<div class="appConfigRegion"><select id="summonerregion" name="summonerregion" data-size="4" data-downarrow="appSelectArrow"></select></div>';
	htmlOutput += '		<div class="appConfigSummonername"><input type="text" name="summonername" id="summonername" value="'+this.summonername+'" placeholder="Summoner name"></div>';
	htmlOutput += '		<div class="appConfigButton"><input type="submit" name="submitConfig" id="submitConfig" value="Save"></div>';
	htmlOutput += '		<div class="appConfigMessage"><div class="itemErrorIcon">[ <span class="altColor">!</span> ]</div><div class="itemErrorMessage">Summoner does not exists</div></div>';
	htmlOutput += '		<div class="clear"></div>';
	htmlOutput += '	</div>';
	htmlOutput += '</div>';
	htmlOutput += '<div class="appClose"></div>';
	
	$('#config').append(htmlOutput);
	
	commandTrigger('lolwizCommandConfigReady');
	
	$('#summonername').mousedown( function( event ) {
		event.stopPropagation()
	});

	$('.appConfigRegion select').selectBoxIt( {
		autoWidth: false,
		showFirstOption: false,
		populate: regions
	});
	
	if (this.region == '' || this.region == 'none' || this.region == null ) {
	} else {
		$(".appConfigRegion select").data("selectBox-selectBoxIt").selectOption(this.region);
	}
	$('.appConfigRegion select').change(function () {
		this.updateSubmitButton();
	}.bind(this));
	$('.appConfigSummonername input').keyup(function () {
		this.updateSubmitButton();
	}.bind(this));

	$('#summonerregionSelectBoxItOptions').niceScroll({cursorcolor:"#3CAAFF",cursorborder:"0 solid #3CAAFF",cursoropacitymax:0.56,railpadding:{top:0,right:2,left:0,bottom:0},horizrailenabled:false});
	
	$('#submitConfig').click( function() {
		this.submitForm();
	}.bind(this));

	if (this.summonername == '' || (this.region == '' || this.region == 'none')) {
		$('#submitConfig').eventPause('pause','click')
		$('#submitConfig').addClass('itemdisabled');
	}
	
	$('.appClose').click( function() {
		this.closeWindow();
	}.bind(this));

	$('.appBox').mousedown( function() {
		this.dragWindow();
	}.bind(this));

};
LoLwizConfig.prototype.updateSubmitButton = function() {
	region = $('.appConfigRegion select').val();
	summoner = $('.appConfigSummonername input').val();

	if ((region == '' || region == 'none' || region == null ) || (summoner == '' || summoner.length < 3)) {
		$('#submitConfig').eventPause('pause','click')
		$('#submitConfig').addClass('itemdisabled');
	} else {
		$('#submitConfig').eventPause('active','click')
		$('#submitConfig').removeClass('itemdisabled');
	}
}
LoLwizConfig.prototype.dragWindow = function() {
	overwolf.windows.getCurrentWindow (function(result) {
		if (result.status == "success"){
			overwolf.windows.dragMove(result.window.id);
		}			
	}.bind(this));
};

LoLwizConfig.prototype.closeWindow = function() {
	this.toggleVisibility();
};


LoLwizConfig.prototype.closeAndSave = function() {
	this.region = this.chosenRegion;
	this.summonername = this.chosenSummonername;
	config = { region: this.region, summonername: this.summonername, left: this.left }

	localStorage.setItem("lolwizConfig", JSON.stringify(config));
	this.resetConfig();
	this.closeWindow();
};
LoLwizConfig.prototype.resetConfig = function() {
	$('#submitConfig').val('Save');
	$('#submitConfig').eventPause('active','click')
	$('#submitConfig').removeClass('itemdisabled');
	
}
LoLwizConfig.prototype.displayError = function() {
	$('#submitConfig').val('Save');
	$('#submitConfig').eventPause('active','click')
	$('#submitConfig').removeClass('itemdisabled');
	$('.itemErrorMessage').html(this.formErrorMessage);
	$('.appConfigMessage').show();
	
}
LoLwizConfig.prototype.submitForm = function() {
	$('#submitConfig').val('SAVING');
	$('#submitConfig').eventPause('pause','click')
	$('#submitConfig').addClass('itemdisabled');
	$('.appConfigMessage').hide();
	$('.itemErrorMessage').html();
	this.chosenRegion = $('#summonerregion').val();
	this.chosenSummonername = $('#summonername').val();
	this.checkSummoner();
}
LoLwizConfig.prototype.checkSummoner = function() {
	$.ajax({
		url: "http://api.lolwiz.gg/doPlayerCheck/" + this.chosenRegion + "/" + encodeURI(this.chosenSummonername),
		type: 'GET',
		async: true,
		success: function (data) {
			apijson = $.parseJSON(data);
			if (apijson.success) {
				this.closeAndSave();
			} else {
				this.formErrorMessage = apijson.content.error.text;
				this.displayError();
			}

		}.bind(this),
		error: function (data) {
			this.formErrorMessage = 'The LoLwiz API is not responding';
			this.displayError();
		}.bind(this)
	});

}

$(document).ready( function () {
	var appConfig = new LoLwizConfig();
	appConfig.init();
});