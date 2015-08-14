

function LoLwiz() {
	this.region = "";
	this.summonername = "";
	this.left = "";
	this.screenWidth = 0;
	this.screenHeight = 0;
	this.gameWidth = 0;
	this.gameHeight = 0;
	this.configLoaded = 0;
	this.helpLoaded = 0;
	this.browserLoaded = 0;
	this.configDone = false;
	this.helpDone = false;
	this.browserDone = false;
	this.baseConfig = "{\"region\":\"\",\"summonername\":\"\",\"left\":\"\"}";
	this.runOnce = 0;
	this.isIngame = false;
};

LoLwiz.prototype.init = function() {
	_gaq.push(['_trackPageview', 'v26/start/']);
	this.detectScreenSize();
	this.initEvents();
//	this.initHotkeys();
	this.loadConfig();
	this.positionWindow();
	this.buildMain();
	this.initOverlay();
	this.updateOverlayWindowScreen();
};

LoLwiz.prototype.loadConfig = function() {
	try {
		config = localStorage.getItem("lolwizConfig");
		if (typeof(config) === "undefined" || config == null || config == 'null') {
			config = $.parseJSON(this.baseConfig);
		} else {
			config = $.parseJSON(config);
		}
	} catch (err) {
		config = $.parseJSON(this.baseConfig);
	}

	this.left = config.left;
	this.region = config.region;
	this.summonername = config.summonername;
};

LoLwiz.prototype.initEvents = function() {
		window.addEventListener('storage', function( storageEvent ){

		storageValue = JSON.parse( storageEvent.newValue );

		switch( storageEvent.key ){ 
			case 'lolwizConfig':
				this.region = storageValue.region;
				this.summonername = storageValue.summonername;
				this.left = storageValue.left;
				break;

			case 'lolwizLink':
				this.doBrowser();
				break;
			case 'lolwizLoaddata':
				if (!this.loadingData) {
					if (!this.dataBaseLoaded) {
						this.loadingData = true;
						this.loadGamedata(storageValue.trigger);
					}
				}
				break;
			case 'lolwizLoadranked':
				this.loadRankedStats(storageValue.summonerId,storageValue.summonerName,storageValue.champion,storageValue.trigger);
				break;

			case 'lolwizGetranked':
				this.getRankedStats(storageValue.summonerId);
				break;
			
			case 'lolwizOverlayDone':
				this.overlayDone = true;
				break;

			case 'lolwizCommandConfigReady':
				this.configDone = true;
				break;

			case 'lolwizCommandHelpReady':
				this.helpDone = true;
				break;

			case 'lolwizCommandBrowserReady':
				this.browserDone = true;
				break;

		}

	}.bind(this), false);

	overwolf.games.onGameInfoUpdated.addListener(
		function (gameData) {
			if (gameData.gameInfo !== null) {
				if (gameData.resolutionChanged === true) {
					this.detectGameResolution(gameData);
					this.updateOverlayWindow();
				}
				if (gameData.focusChanged === true) {
					if (gameData.gameInfo.isInFocus === false) {
						$('body').show();
					} else {
						$('body').hide();
					}
				}
				if (gameData.gameInfo.isInFocus === true || this.isIngame == true) {
						this.isIngame = true;
						if (this.runOnce == 0) {
							$('body').hide();
							this.detectGameResolution(gameData);
							this.updateOverlayWindow();
							this.runOnce = 1;
						}
				} else {
						this.isIngame = false;
				}
				if (gameData.runningChanged === true) {
					if (gameData.gameInfo.isRunning === false) {
						this.isIngame = false;
						$('body').show();
						$('.itemStats').eventPause('pause','click')
						$('.itemStats').addClass("itemDisabled");
					}
					if (gameData.gameInfo.isRunning === true) {
						this.isIngame = true;
						$('body').hide();
						$('.itemStats').eventPause('active','click')
						$('.itemStats').removeClass("itemDisabled");
					}
				}
			} else {
			}
		}.bind(this)
	);
	overwolf.games.onGameLaunched.addListener(
		function (gameData) {
			this.isIngame = true;
			$('body').hide();
			$('.itemStats').eventPause('active','click')
			$('.itemStats').removeClass("itemDisabled");
		}.bind(this)
	);

};

LoLwiz.prototype.positionWindow = function() {
	overwolf.windows.getCurrentWindow (function(result) {
		if (result.status == "success"){
			if (this.left == "") {
//				overwolf.windows.changePosition(result.window.id,Math.floor(((this.screenWidth-result.window.width)*0.75)),1, null);
//			} else {
//				overwolf.windows.changePosition(result.window.id,this.left,1,null);
			}
		}			
	}.bind(this));
};

LoLwiz.prototype.detectGameResolution = function(gameData) {
	this.gameWidth = gameData.gameInfo.width;
	this.gameHeight = gameData.gameInfo.height;
}

LoLwiz.prototype.logData = function() {
	console.log('Region: ' + this.region + ' Summonername: ' + this.summonername);
}

LoLwiz.prototype.buildMain = function() {
	var timeoutId, delay = 800;

	htmlOutput = "";
	htmlOutput += '<div class="appBorder">';
	htmlOutput += '	<div class="appBox">';
	htmlOutput += '		<div class="itemLogo"></div>';
	htmlOutput += '		<div class="appItem itemStats"></div>';
	htmlOutput += '		<div class="appItem itemBookmarks"></div>';
	htmlOutput += '		<div class="appItem itemHelp"></div>';
	htmlOutput += '		<div class="appItem itemConfig"></div>';
	htmlOutput += '	</div>';
	htmlOutput += '</div>';
	htmlOutput += '<div class="appClose"></div>';

	$('#main').append(htmlOutput);

/*
	$('.appBox').mouseenter(
		function() {
			this.showGlow();
		}.bind(this)
	);
	$('.appBox').mouseleave(
		function() {
			this.hideGlow();
		}.bind(this)
	);
	$('.appBox').click(
		function() {
			this.showApp();
		}.bind(this)
	);
	

	$('#main').mouseleave(
		function() {
			this.hideApp();
		}.bind(this)
	);
*/
	$('.itemConfig').click( function() {
		this.doConfig();
	}.bind(this));
	$('.itemBookmarks').click( function() {
		this.doBrowser();
	}.bind(this));
	$('.itemHelp').click( function() {
		this.doHelp();
	}.bind(this));
	
	$('.itemStats').click( function() {
		guid = createGuid();
		data = { random: guid }
		localStorage.setItem("lolwizShowHide", JSON.stringify(data));
	}.bind(this));

	$('.itemStats').addClass("itemDisabled");
	$('.itemStats').eventPause('pause','click')
	$('.itemConfig').addClass("itemDisabled");
	$('.itemConfig').eventPause('pause','click')
	$('.itemBookmarks').addClass("itemDisabled");
	$('.itemBookmarks').eventPause('pause','click')
	$('.itemHelp').addClass("itemDisabled");
	$('.itemHelp').eventPause('pause','click')

	
	$('.appClose').click( function() {
		this.closeApp();
	}.bind(this));




};
LoLwiz.prototype.showGlow = function() {
	$('.appBorder').css( { 'background-color': 'rgba(255,255,255,0.8)' }, 'fast');
}
LoLwiz.prototype.hideGlow = function() {
	$('.appBorder').css( { 'background-color': 'rgba(255,255,255,0.5)' }, 'fast');
}
LoLwiz.prototype.showApp = function() {
	if (this.isIngame) {
		$('body').hide();
	}
	this.hideGlow();
//	$('.appBox').eventPause('pause','mouseenter ')
	$('.appBox').mousedown( function() {
		this.dragWindow();
	}.bind(this));
	$('.appBox').mouseup( function() {
		this.dropWindow();
	}.bind(this));
	$('.appBox').css( { cursor: 'move' } );
	$('.appBox').animate( { cursor: 'move', 'opacity' : '1' },'fast' );
	$('.appBorder').animate({ width: '100%', padding: '5px', height: '112px' },'fast');
	$('#main').animate({ top: '0' },'fast');
};

LoLwiz.prototype.hideApp = function() {
//	$('.appBox').eventPause('active','mouseenter ')
	$('.appBox').unbind('mousedown mouseup');
	$('.appBox').css( { cursor: 'pointer' } );
	$('.appBox').animate( { cursor: 'pointer', 'opacity' : '0.3' },'fast' );
	$('.appBorder').animate({ width: '50%', padding: '3px', height: '107px' },'fast');
	$('#main').animate({ top: '-90px' },'fast');
};

LoLwiz.prototype.detectScreenSize = function() {
	this.screenWidth = screen.availWidth;
	this.screenHeight = screen.availHeight;
	overwolf.windows.getCurrentWindow (function(result) {
		if (result.status == "success"){
			this.windowInfoMain = result;
		}			
	}.bind(this));
};

LoLwiz.prototype.dragWindow = function() {
	overwolf.windows.getCurrentWindow (function(result) {
		if (result.status == "success"){
			$('.appMainBox').eventPause('pause','mouseenter ')
			$('.appItem').eventPause('pause','mouseenter mouseleave')
			$('#main').eventPause('pause','mouseleave')
			overwolf.windows.dragMove(result.window.id);
		}			
	}.bind(this));
};

LoLwiz.prototype.dropWindow = function() {
	overwolf.windows.getCurrentWindow (function(result) {
		if (result.status == "success"){
			$('.appMainBox').eventPause('active','mouseenter')
			$('.appItem').eventPause('active','mouseenter mouseleave')
			$('#main').eventPause('active','mouseleave')
			this.left = result.window.left;
			if (this.left < 0) {
				this.left = 0;
			}
			this.saveConfig();
//			overwolf.windows.changePosition(result.window.id,this.left,1,null);
		}			
	}.bind(this));
};

LoLwiz.prototype.closeApp = function() {
	overwolf.windows.getCurrentWindow (function(result) {
		if (result.status == "success"){
			overwolf.windows.close(result.window.id, null);;
		}			
	}.bind(this));
};

LoLwiz.prototype.saveConfig = function() {
	config = { region: this.region, summonername: this.summonername, left: this.left }
	localStorage.setItem("lolwizConfig", JSON.stringify(config));
};

LoLwiz.prototype.doConfig = function() {
	commandTrigger('lolwizCommandConfigToggle');
};
LoLwiz.prototype.doHelp = function() {
	commandTrigger('lolwizCommandHelpToggle');
};
LoLwiz.prototype.doBrowser = function() {
	commandTrigger('lolwizCommandBrowserToggle');
};
LoLwiz.prototype.updateOverlayWindow = function() {
	overwolf.windows.obtainDeclaredWindow ("overlay", function(result) {
		if (result.status == "success"){
			overwolf.windows.changePosition(result.window.id,0,0, null);
			overwolf.windows.changeSize(result.window.id,this.gameWidth,this.gameHeight, null);
		}
	}.bind(this));
};

LoLwiz.prototype.updateOverlayWindowScreen = function() {
	overwolf.windows.obtainDeclaredWindow ("overlay", function(result) {
		if (result.status == "success"){
			overwolf.windows.changePosition(result.window.id,0,0, null);
			overwolf.windows.changeSize(result.window.id,this.screenWidth,this.screenHeight, null);
		}
	}.bind(this));
};

LoLwiz.prototype.initOverlay = function() {
	overwolf.windows.getCurrentWindow ( function(result) {
		if (result.status == "success"){
			if ((result.window.top == 0 && result.window.left == 0) || (result.window.top == 1 && result.window.left == 0)) {
				overwolf.windows.changePosition(result.window.id,Math.floor(((this.screenWidth-result.window.width)/2)),Math.floor((this.screenHeight/2)-200), null);
			}
		}
	}.bind(this));

	overwolf.windows.obtainDeclaredWindow ("overlay", function(result) {
		if (result.status == "success"){
			overwolf.windows.restore(result.window.id,null);
		}
	}.bind(this));
	overwolf.windows.obtainDeclaredWindow ("config", function(result) {
		if (result.status == "success"){
			this.windowInfoConfig = result.window;
			overwolf.windows.changePosition(this.windowInfoConfig.id,Math.floor(((this.screenWidth-this.windowInfoConfig.width)/2)),Math.floor((this.screenHeight/2)-80),function(result) { 
				overwolf.windows.restore(this.windowInfoConfig.id, function(result) { });
				overwolf.windows.minimize(this.windowInfoConfig.id, function(result) { });
			}.bind(this));
		}
	}.bind(this));
	overwolf.windows.obtainDeclaredWindow ("help", function(result) {
		if (result.status == "success"){
			this.windowInfoHelp = result.window;
			overwolf.windows.changePosition(this.windowInfoHelp.id,Math.floor(((this.screenWidth-this.windowInfoHelp.width)/2)-this.windowInfoHelp.width),356,function(result) { 
				overwolf.windows.restore(this.windowInfoHelp.id, function(result) { });
				overwolf.windows.minimize(this.windowInfoHelp.id, function(result) { });
			}.bind(this));
		}
	}.bind(this));
	overwolf.windows.obtainDeclaredWindow ("browser", function(result) {
		if (result.status == "success"){
			this.windowInfoBrowser = result.window;
			overwolf.windows.changePosition(this.windowInfoBrowser.id,Math.floor(((this.screenWidth-this.windowInfoBrowser.width)/2)),100,function(result) { 
				overwolf.windows.restore(this.windowInfoBrowser.id, function(result) { });
				overwolf.windows.minimize(this.windowInfoBrowser.id, function(result) { });
			}.bind(this));
		}
	}.bind(this));

	
	this.loadingTime = setInterval( function() {
		if (this.configDone) {
			$('.itemConfig').removeClass("itemDisabled");
			$('.itemConfig').eventPause('active','click')
		}
		if (this.browserDone) {
			$('.itemBookmarks').removeClass("itemDisabled");
			$('.itemBookmarks').eventPause('active','click')
		}
		if (this.helpDone) {
			$('.itemHelp').removeClass("itemDisabled");
			$('.itemHelp').eventPause('active','click')
		}
		if (this.configDone && this.helpDone && this.browserDone) {
			if (this.region == '' || this.region == 'none' || this.summonername == '') {
				this.doConfig();
			}
			clearInterval(this.loadingTime);
		}
	}.bind(this), 200);


	s = document.location.href;
	if (s.indexOf("gamelaunchevent") > -1) {
		this.isIngame = true;
		_gaq.push(['_trackPageview', 'v26/gamestarted/']);
		setTimeout( function() {
			overwolf.games.getRunningGameInfo( function(gameInfo) {
				this.gameWidth = gameInfo.width;
				this.gameHeight = gameInfo.height;
				this.updateOverlayWindow();
				$('body').hide();
			}.bind(this));
		}.bind(this), 1500);
	}
	setTimeout( function() {
		overwolf.games.getRunningGameInfo( function(gameInfo) {
			if (gameInfo != null) {
				this.gameWidth = gameInfo.width;
				this.gameHeight = gameInfo.height;
				this.updateOverlayWindow();
				$('body').hide();
			}
		}.bind(this));
	}.bind(this), 1500);

	this.showApp();

	

//	$('.appBox').trigger('click');

}
function LoLwizKey() {
	this.key = "";
	this.keyConfig = "{\"key\":\"\"}";
	this.screenWidth = 0;
	this.screenHeight = 0;
	this.formErrorMessage = '';
};

LoLwizKey.prototype.keySetup = function() {
	overwolf.windows.getCurrentWindow ( function(result) {
		if (result.status == "success"){
			overwolf.windows.changePosition(result.window.id,0,0, null);
			overwolf.windows.changeSize(result.window.id,this.screenWidth,this.screenHeight, null);
		}
	}.bind(this));

	htmlOutput = "";
	htmlOutput += '<div class="appKey">';
	htmlOutput += '	<div class="appBorder">';
	htmlOutput += '		<div class="appBox">';
	htmlOutput += '			<div class="appClose"></div>';
	htmlOutput += '			<div class="itemLogo"></div>';
	htmlOutput += '			<div class="appConfigSummonername"><input type="text" name="key" id="key" value="" placeholder="Enter your LoLwiz closed beta key"></div>';
	htmlOutput += '			<div class="appIntroText">If you don\'t have a beta key, you can enter our waiting list at <a href="http://beta.lolwiz.gg" target="_blank">beta.lolwiz.gg</a> OR if one of your friends has a beta key, they will have up to 10 invites - ask them to invite you!</div>';
	htmlOutput += '			<div class="appConfigButton"><input type="submit" name="submitConfig" id="submitConfig" value="Redeem"></div>';
	htmlOutput += '			<div class="appConfigMessage"><div class="itemErrorIcon">[ <span class="altColor">!</span> ]</div><div class="itemErrorMessage">Summoner does not exists</div></div>';
	htmlOutput += '		</div>';
	htmlOutput += '	</div>';
	htmlOutput += '</div>';

	$('body').append(htmlOutput);
	$('.appClose').click( function() {
		this.closeApp();
	}.bind(this));
	$('#submitConfig').click( function() {
		this.submitForm();
	}.bind(this));
	$('.appKey').draggable();
};

LoLwizKey.prototype.init = function() {
	try {
		config = localStorage.getItem("lolwizKeyConfig");
		if (typeof(config) === "undefined" || config == null || config == 'null') {
			config = $.parseJSON(this.keyConfig);
		} else {
			config = $.parseJSON(config);
		}
	} catch (err) {
		config = $.parseJSON(this.keyConfig);
	}

	this.key = config.key;
	this.screenWidth = screen.availWidth;
	this.screenHeight = screen.availHeight;

	if (this.key == '') {
		this.keySetup();
	} else {
		this.checkKey(this.key);
	}
};

LoLwizKey.prototype.closeApp = function() {
	overwolf.windows.getCurrentWindow (function(result) {
		if (result.status == "success"){
			overwolf.windows.close(result.window.id, null);;
		}			
	}.bind(this));
};
LoLwizKey.prototype.submitForm = function() {
	$('#submitConfig').val('Validating');
	$('#submitConfig').eventPause('pause','click')
	$('#submitConfig').addClass('itemdisabled');
	$('.appConfigMessage').hide();
	$('.itemErrorMessage').html();
	this.key = $('#key').val();
	this.redeemKey();
}
LoLwizKey.prototype.displayError = function() {
	$('#submitConfig').val('Redeem');
	$('#submitConfig').eventPause('active','click')
	$('#submitConfig').removeClass('itemdisabled');
	$('.itemErrorMessage').html(this.formErrorMessage);
	$('.appConfigMessage').show();
	config = { key: '' }
	localStorage.setItem("lolwizKeyConfig", JSON.stringify(config));
}
LoLwizKey.prototype.redeemKey = function() {
	$.ajax({
		url: "http://beta.lolwiz.gg/redeem.php?gen_key=" + this.key,
		type: 'GET',
		async: true,
		timeout: 3000,
		success: function (data) {
			apijson = $.parseJSON(data);
			if (apijson.hash === false) {
					this.formErrorMessage = 'Invalid beta key';
					this.displayError();
			} else {
				if (apijson.usage >= 0 && apijson.usage < 20) {
					this.closeAndSave();
				} else {
					this.formErrorMessage = 'Beta key has already been redeemed';
					this.displayError();
				}
			}
		}.bind(this),
		error: function (data) {
			this.formErrorMessage = 'The LoLwiz API is not responding';
			this.displayError();
		}.bind(this)
	});

}
LoLwizKey.prototype.checkKey = function() {
	$.ajax({
		url: "http://beta.lolwiz.gg/verify.php?gen_key=" + this.key,
		type: 'GET',
		async: true,
		timeout: 3000,
		success: function (data) {
			apijson = $.parseJSON(data);
			if (apijson.usage >= 0) {
				this.closeAndSave();
			} else {
				this.formErrorMessage = 'Beta key has already been redeemed';
				this.keySetup()
				this.displayError();
			}

		}.bind(this),
		error: function (data) {
			this.formErrorMessage = 'The LoLwiz API is not responding';
			this.keySetup()
			this.displayError();
		}.bind(this)
	});

}
LoLwizKey.prototype.closeAndSave = function() {
	config = { key: this.key }
	localStorage.setItem("lolwizKeyConfig", JSON.stringify(config));
	$(".appKey").remove();
	overwolf.windows.getCurrentWindow ( function(result) {
		if (result.status == "success"){
			overwolf.windows.changeSize(result.window.id,182,122, null);
		}
	}.bind(this));
	var app = new LoLwiz();
	app.init();
}

$(document).ready( function () {
//	var key = new LoLwizKey();
//	key.init();

	var app = new LoLwiz();
	app.init();

	console.log('LoLwiz Started');
});