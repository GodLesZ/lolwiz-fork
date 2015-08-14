
function LoLwizOverlay() {
	this.region = "";
	this.summonername = "";
	this.left = "";
	this.baseConfig = "{\"region\":\"\",\"summonername\":\"\",\"left\":\"\"}";
	this.loadingScreen = false;
	this.dataBaseLoaded = false;
	this.dataTriedLoad = 0;
	this.dataLoaded = 0;
	this.stateNotify = 0;
	this.stateLoading = 0;
	this.rankedData = {};
	this.timerRanked = {};
	this.timerRankedLoaded = "";
	this.serviceMessage = "";
	this.summonerChampion = "";
	this.summonerChampionId = 0;
	this.trackingStartTime = 0;
	this.isIngame = 0;

	this.errorTryAgain = [1,2,4,100,7,101];
}

LoLwizOverlay.prototype.init = function() {
	setChampion(this.summonerChampion, this.summonerChampionId);
	this.loadEvents();
	this.loadConfig();
	this.build();
	this.initHotkeys();
};

LoLwizOverlay.prototype.loadEvents = function() {
	window.addEventListener('storage', function( storageEvent ){
		storageValue = JSON.parse( storageEvent.newValue );
		storageValueOld = JSON.parse( storageEvent.newValue );

		switch( storageEvent.key ){ 
			case 'lolwizConfig':
				if (storageValue != storageValueOld) {
					this.loadConfigAgain();
				}
				break;
			
			case 'lolwizShowHide':
				this.showHideStates();
				break;

		}

	}.bind(this), false);

	overwolf.games.onGameInfoUpdated.addListener(
		function (gameData) {
			if (gameData.gameInfo !== null) {
				if (gameData.runningChanged === true) {
					if (gameData.gameInfo.title == 'League of Legends') {
						if (gameData.gameInfo.isRunning === false) {
							this.resetGame();
							this.hideNotify();
							this.hideStats();
							this.hideLoading();
							_gaq.push(['_trackPageview', 'v26/gameended/']);
						} else {
							this.showHideStatesForceCloseAll();
						}
					}
				}
				if (gameData.gameInfo.isRunning === true) {
					if (gameData.gameInfo.title == 'League of Legends') {
						this.isIngame = 1;
					} else {
						this.showHideStatesForceCloseAll();
					}
				}

				if (this.dataTriedLoad == 0) {
					if (gameData.gameInfo.title == 'League of Legends') {
						this.dataTriedLoad = 1;
						this.resetGame();
						this.loadingScreen = false;
						this.doLoading();
					} else {
						this.showHideStatesForceCloseAll();
					}
				}
			} 
		}.bind(this)
	);

	overwolf.games.onMajorFrameRateChange.addListener(
		function (arg) {
			if (arg.fps > 13) {
				if (this.loadingScreen) {
					this.loadingScreen = false;
				}
			}
		}.bind(this)
	);
	overwolf.games.onGameLaunched.addListener(
		function (gameInfo) {
			if (gameInfo.title == 'League of Legends') {
				_gaq.push(['_trackPageview', 'v26/gamestarted/']);
				this.dataTriedLoad = 1;
				this.resetGame();
				this.isIngame = 1;
				this.loadingScreen = true;
				this.doLoading();
			} else {
				this.showHideStatesForceCloseAll();
			}

		}.bind(this)
	);
};

LoLwizOverlay.prototype.loadConfig = function() {
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
LoLwizOverlay.prototype.loadConfigAgain = function() {
	if (this.isIngame == 1) {
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
		this.doLoading();
	}
};

LoLwizOverlay.prototype.initHotkeys = function() {
	overwolf.settings.registerHotKey(
		"hotkey2",
		function(arg) {
			if (arg.status == "success") {
				this.showHideStates();
			}
		}.bind(this)
	);
};
LoLwizOverlay.prototype.build = function() {
	htmlOutput = "";
	htmlOutput += '<div class="appStatWindow">';
	htmlOutput += '	<div class="appBorder">';
	htmlOutput += '		<div class="appBox">';
	htmlOutput += '			<div class="appSummonersTop">';

	htmlOutput += '			</div>';
	htmlOutput += '			<div class="divider">';
	htmlOutput += '				<div class="divider-tr">';
	htmlOutput += '					<div class="itemLogoLolking">EXTENDED STATS BY</div>';
	htmlOutput += '					<div class="div-left">';
	htmlOutput += '						<div class="multi-border"></div>';
	htmlOutput += '					</div>';
	htmlOutput += '					<div class="itemLogo">[ Shift + Tab ]</div>';
	htmlOutput += '					<div class="div-right">';
	htmlOutput += '						<div class="multi-border"></div>';
	htmlOutput += '					</div>';
	htmlOutput += '					<div class="itemLogoCloud9">IN COLLABORATION WITH</div>';
	htmlOutput += '				</div>';
	htmlOutput += '			</div>';

	htmlOutput += '			<div class="appSummonersBottom">';

	htmlOutput += '			</div>';
	htmlOutput += '		</div>';
	htmlOutput += '	</div>';
	htmlOutput += '	<div class="appClose"></div>';
	htmlOutput += '	<div class="appReload"></div>';
	htmlOutput += '	<div class="appBookmarks"></div>';
	htmlOutput += '</div>';
	
	htmlOutput += '<div class="appStatNotification">';
	htmlOutput += '	<div class="appBorder">';
	htmlOutput += '		<div class="appBox">';
	htmlOutput += '			<div class="itemLogo"></div>';
	htmlOutput += '			<div class="appStatsNotifyText"><span id="notifyMessage"></span> | <span class="altColor">Shift + Tab</span></div>';
	htmlOutput += '		</div>';
	htmlOutput += '	</div>';
	htmlOutput += '	<div class="appClose"></div>';
	htmlOutput += '	<div class="appBookmarks"></div>';
	htmlOutput += '</div>';
	
	htmlOutput += '<div class="appStatLoading">';
	htmlOutput += '	<div class="appBorder">';
	htmlOutput += '		<div class="appBox">';
	htmlOutput += '			<div class="itemLogo"></div>';
	htmlOutput += '			<div class="appStatsLoadingProgressWrapper">';
	htmlOutput += '				<div class="appStatsLoadingText">Loading base stats...</div>';
	htmlOutput += '				<div class="appStatsLoadingProgress">';
	htmlOutput += '					<div class="appStatsProgressBar" id="baseStats"><span class="progressBaseActive"></span></div>';
	htmlOutput += '				</div>';
	htmlOutput += '				<div class="appStatsLoadingText">Loading ranked stats...</div>';
	htmlOutput += '				<div class="appStatsLoadingProgress">';
	htmlOutput += '					<div class="appStatsProgressBar" id="rankedStats"><span class="progressBaseActive"></span></div>';
	htmlOutput += '				</div>';
	htmlOutput += '			</div>';
	htmlOutput += '			<div class="appStatsLoadingErrorWrapper">';
	htmlOutput += '				<div class="appStatsLoadingErrorHeadline">Oops, something went wrong</div>';
	htmlOutput += '				<div class="appStatsLoadingErrorText"></div>';
	htmlOutput += '				<div class="appStatsLoadingErrorButtons"><input type="button" name="statsRetry" id="statsRetry" value="Retry"><input type="button" name="statsShow" id="statsShow" value="Show stats"></div>';
	htmlOutput += '			</div>';
	htmlOutput += '			<div class="appStatsLoadingHint">"Toggle the in-game LoLwiz overlay with the shortcut <span class="altColor">SHIFT + TAB</span> or pressing the Stats icon in the app"</div>';
	htmlOutput += '		</div>';
	htmlOutput += '	</div>';
	htmlOutput += '	<div class="appClose"></div>';
	htmlOutput += '	<div class="appBookmarks"></div>';
	htmlOutput += '</div>';

	$('#overlay').append(htmlOutput);
	$('#statsRetry').click( function() {
		this.doLoading();
	}.bind(this));
	$('.appStatWindow .appReload').click( function() {
		this.doLoading();
	}.bind(this));
	$('#statsShow').click( function() {
		this.showHideStatesForce();
	}.bind(this));
	$('.appStatLoading .appClose').click( function() {
		this.showHideStates();
	}.bind(this));
	$('.appStatNotification .appClose').click( function() {
		this.showHideStatesNote();
	}.bind(this));
	$('.appStatWindow .appClose').click( function() {
		this.showHideStates();
	}.bind(this));
	$('.itemLogoLolking').mouseenter( function() {
		$(this).addClass("hover");
	});
	$('.itemLogoLolking').mouseleave( function() {
		$(this).removeClass("hover");
	});
	$('.itemLogoCloud9').mouseenter( function() {
		$(this).addClass("hover");
	});
	$('.itemLogoCloud9').mouseleave( function() {
		$(this).removeClass("hover");
	});
	$('.itemLogoCloud9').click( function() {
		homepageLink = "http://www.cloud9.gg/";
		openUrl(homepageLink,'cloud9link');
	});

	$('.appConfig').click( function() {
		this.doConfig();
	}.bind(this));
	$('.appBookmarks').click( function() {
		this.doBrowser();
	}.bind(this));
	$('.appHelp').click( function() {
		this.doHelp();
	}.bind(this));
	$('.appStats').click( function() {
		this.doStats();
	}.bind(this));


	overwolf.games.getRunningGameInfo(function(gameInfo){
		if (gameInfo.isRunning === true) {
			if (this.dataTriedLoad == 0) {
				if (gameInfo.title == 'League of Legends') {
					this.dataTriedLoad = 1;
					this.resetGame();
					this.loadingScreen = false;
					this.doLoading();
				}
			}
		}
	}.bind(this));

};
LoLwizOverlay.prototype.doConfig = function() {
	commandTrigger('lolwizCommandConfigToggle');
};
LoLwizOverlay.prototype.doHelp = function() {
	commandTrigger('lolwizCommandHelpToggle');
};
LoLwizOverlay.prototype.doBrowser = function() {
	commandTrigger('lolwizCommandBrowserToggle');
};
LoLwizOverlay.prototype.doStats = function() {
	this.showHideStates();
};

LoLwizOverlay.prototype.resetGame = function() {
	this.loadingScreen = false;
	this.dataBaseLoaded = false;
	this.dataLoaded = 0;
	this.stateNotify = 0;
	this.stateLoading = 0;
	this.rankedData = {};
	this.timerRanked = {};
	this.timerRankedLoaded = "";
	this.serviceMessage = "";
	this.summonerChampion = "";
	this.summonerChampionId = 0;
	this.isIngame = 0;
	setChampion(this.summonerChampion, this.summonerChampionId);
}
LoLwizOverlay.prototype.blurWindow = function() {
	$(document).blur();
	$(window).blur();
}
LoLwizOverlay.prototype.showHideStatesForceCloseAll = function() {
        this.hideNotify();
        this.hideLoading();
        this.hideStats();
		this.blurWindow();
}
LoLwizOverlay.prototype.showHideStatesForceNotifyOpen = function() {
        this.hideLoading();
        this.hideStats();
        this.showNotify();
		this.blurWindow();
}
LoLwizOverlay.prototype.showHideStatesNote = function() {
        this.hideNotify();
        this.hideLoading();
        this.hideStats();
		this.blurWindow();
}

LoLwizOverlay.prototype.showHideStatesForce = function() {
	this.dataLoaded = 2;
	this.hideNotify();
	this.hideLoading();
	this.showStats();
		this.blurWindow();
}
LoLwizOverlay.prototype.showHideStates = function() {

	overwolf.games.getRunningGameInfo( function(gameInfo) {
		if (gameInfo.title == 'League of Legends') {
			if (this.dataLoaded == 0 || this.dataLoaded == 1) {
				if (this.stateNotify == 1) {
					this.hideNotify();
					this.hideStats();
					this.showLoading();
				} else {
					this.hideLoading();
					this.hideStats();
					this.showNotify();
				}
			} else {
				if (this.stateStats == 0) {
					this.hideNotify();
					this.hideLoading();
					this.showStats();
				} else {
					this.hideNotify();
					this.hideLoading();
					this.hideStats();
				}
			}
			this.blurWindow();
		}
	}.bind(this));

}
LoLwizOverlay.prototype.showNotify = function() {
	_gaq.push(['_trackPageview', 'v26/notify/show']);
/*
	if (this.dataLoaded == 0) {
		$('.appStatNotification .appClose').hide();
	} else {
		$('.appStatNotification .appClose').show();
	}
*/
	this.stateNotify = 1;
	$('.appStatNotification').show();
}
LoLwizOverlay.prototype.hideNotify = function() {
	this.stateNotify = 0;
	$('.appStatNotification').hide();
}
LoLwizOverlay.prototype.showLoading = function() {
	_gaq.push(['_trackPageview', 'v26/loading/show']);
	this.stateLoading = 1;
	$('.appStatLoading').show();
}
LoLwizOverlay.prototype.hideLoading = function() {
	this.stateLoading = 0;
	$('.appStatLoading').hide();
}
LoLwizOverlay.prototype.showStats = function() {
	_gaq.push(['_trackPageview', 'v26/stats/show']);
	this.stateStats = 1;
	$('.appStatWindow').show();
}
LoLwizOverlay.prototype.hideStats = function() {
	this.stateStats = 0;
	$('.appStatWindow').hide();
}

LoLwizOverlay.prototype.doLoading = function() {
	if (this.summonername == "" || this.region == "") {
		$('.appStatNotification #notifyMessage').html('<span class="colorError">Setup not completed</span>');
	} else {
			this.dataLoaded = 0;
			if (this.stateLoading == 1) {
				this.hideNotify();
			} else if (this.stateStats == 1) {
				this.hideNotify();
				this.showLoading();
			} else {
				this.hideLoading();
				this.showNotify();
			}
			this.hideStats();
			
			$('.appStatNotification #notifyMessage').html('Loading stats window...');
			$('.appStatLoading #baseStats .progressBaseActive').css( { width: "50%" } );
			$('.appStatLoading #rankedStats .progressBaseActive').css( { width: "0%" } );
			$('.appStatLoading .appStatsLoadingProgressWrapper').show();
			$('.appStatLoading .appStatsLoadingErrorWrapper').hide();

			$('.itemLogoLolking').unbind('click').bind('click', function() {
		//		statsLink = "http://www.lolskill.net/game/" + this.region + "/" + this.summonername;
				statsLink = "http://www.lolking.net";
				openUrl(statsLink,'lolkingGame');
			}.bind(this));

		this.startLookup();
	}
}

LoLwizOverlay.prototype.startLookup = function() {
	_gaq.push(['_trackPageview', 'v26/lookup/']);
	this.trackingStartTime = new Date();
	$.ajax({
		url: "http://api.lolwiz.gg/doGameLookup/" + this.region + "/" + encodeURI(this.summonername),
		type: 'GET',
		success: function (data) {
			var apijson = $.parseJSON(data);
			if (apijson.success) {
				timeElapsed = new Date() - this.trackingStartTime;
				_gaq.push(['_trackPageview', 'v26/lookup/success/']);
				this.dataBaseLoaded = true;
			} else {
				_gaq.push(['_trackPageview', 'v26/lookup/error/'+apijson.content.error.code + '/']);
				this.dataBaseLoaded = false;
			}
			gameData = apijson;
			this.doGameData(gameData);
			this.loadingData = false;
		}.bind(this),
		error: function (data) {
			_gaq.push(['_trackPageview', 'v26/lookup/error/101/']);
			this.loadingData = false;
			this.dataBaseLoaded = false;
			gameData = { success: false, content: { error: { code: 101, message: 'Communication with the Riot API failed' } } };
			this.doGameData(gameData);
		}.bind(this)
	});
}


LoLwizOverlay.prototype.doGameData = function(data) {
	$('.appSummonersTop').empty()
	$('.appSummonersBottom').empty()
	if (data.success) {
		$('.appStatLoading #baseStats .progressBaseActive').css( { width: "100%" } );
		$('.appStatLoading .appStatsLoadingProgressWrapper').show();
		$('.appStatLoading .appStatsLoadingErrorWrapper').hide();
		if (data.content.serviceMessage != '') {
			this.serviceMessage = data.content.serviceMessage;
		} else {
			this.serviceMessage = "";
		}
		this.summonersCount = data.content.teamOne.length + data.content.teamTwo.length;
		this.gameData = data.content;
		for (var i in data.content.teamOne) {
			team = 0;
			summonerId = data.content.teamOne[i].summonerId;
			summonerName = data.content.teamOne[i].summonerName;
			championName = data.content.teamOne[i].championName;
			championId = data.content.teamOne[i].championId;
			championImage = data.content.teamOne[i].championImageUrl;
			isBot = data.content.teamOne[i].isBot;
			summonerTier = data.content.teamOne[i].playerTier;
			summonerTierPast = data.content.teamOne[i].pastTier;
			summonerDivision = data.content.teamOne[i].playerDiv;
			if (summonerTier == 0) {
				if (data.content.serviceMessage != '') {
					summonerTier = 'unknown';
				} else {
					summonerTier = 'unranked';
				}
			}
			masteryAtt = data.content.teamOne[i].masteriesOffence;
			masteryDef = data.content.teamOne[i].masteriesDefence;
			masteryUti = data.content.teamOne[i].masteriesUtility;
			runes = data.content.teamOne[i].runes;
			runesCount = runes.split('<br>').length;
			if (data.content.teamOne[i].summonerId > 0) {
				this.lookupRankedStats(summonerId,summonerName,championId);
			}
			if (summonerId == 0) {
				champNameClean = championName.replace(/[^a-z0-9]/ig, '');
				summonerId = team+champNameClean+championId;
			}
			if (this.summonername == summonerName) {
				this.summonerChampion = championName;
				this.summonerChampionId = championId;
			}
			this.addSummoner(team,summonerId,summonerName,championId,championImage,summonerTier,summonerDivision,masteryAtt,masteryDef,masteryUti,runes,runesCount,isBot,championName,summonerTierPast);
		}
		for (var i in data.content.teamTwo) {
			team = 1;
			summonerId = data.content.teamTwo[i].summonerId;
			summonerName = data.content.teamTwo[i].summonerName;
			championName = data.content.teamTwo[i].championName;
			championId = data.content.teamTwo[i].championId;
			championImage = data.content.teamTwo[i].championImageUrl;
			isBot = data.content.teamTwo[i].isBot;
			summonerTier = data.content.teamTwo[i].playerTier;
			summonerTierPast = data.content.teamTwo[i].pastTier;
			summonerDivision = data.content.teamTwo[i].playerDiv;
			if (summonerTier == 0) {
				if (data.content.serviceMessage != '') {
					summonerTier = 'unknown';
				} else {
					summonerTier = 'unranked';
				}
			}
			masteryAtt = data.content.teamTwo[i].masteriesOffence;
			masteryDef = data.content.teamTwo[i].masteriesDefence;
			masteryUti = data.content.teamTwo[i].masteriesUtility;
			runes = data.content.teamTwo[i].runes;
			runesCount = runes.split('<br>').length;
			if (data.content.teamTwo[i].summonerId > 0) {
				this.lookupRankedStats(summonerId,summonerName,championId);
			}
			if (summonerId == 0) {
				champNameClean = championName.replace(/[^a-z0-9]/ig, '');
				summonerId = team+champNameClean+championId;
			}
			if (this.summonername == summonerName) {
				this.summonerChampion = championName;
				this.summonerChampionId = championId;
			}
			this.addSummoner(team,summonerId,summonerName,championId,championImage,summonerTier,summonerDivision,masteryAtt,masteryDef,masteryUti,runes,runesCount,isBot,championName,summonerTierPast);
		}
		setChampion(this.summonerChampion,this.summonerChampionId);
		this.timerRankedLoaded = setInterval( function() {
			var count = 0;
			var countRankedErrors = 0;
			var countRankedSuccess = 0;
			var countItems = 0;
			for (var k in this.timerRanked) {
				if (this.timerRanked[k] == 0) {
				   ++count;
				}
				if (this.timerRanked[k] == 1) {
					++countRankedErrors;
				}
				if (this.timerRanked[k] == 2) {
					++countRankedSuccess;
				}
				++countItems;
			}
			if (countRankedSuccess > 0) {
				intProcent = Math.floor((countRankedSuccess/countItems)*100);
				$('.appStatLoading #rankedStats .progressBaseActive').css( { width: intProcent+"%" } );
			}
			if (count == 0) {
				clearInterval(this.timerRankedLoaded);
				if (this.serviceMessage != "") {
					this.dataLoaded = 1;
					$('.appStatNotification #notifyMessage').html('<span class="colorError">Something went wrong</span>');
					$('.appStatLoading .appStatsLoadingErrorText').html(this.serviceMessage);
					if (countRankedErrors > 0) {
						$('.appStatLoading .appStatsLoadingErrorText').append(' and ranked stats for '+countRankedErrors+' summoner(s) failed');
					}
					$('.appStatWindow .appReload').show();
					$('.appStatsLoadingErrorWrapper #statsShow').show();
					$('.appStatLoading .appStatsLoadingProgressWrapper').hide();
					$('.appStatLoading .appStatsLoadingErrorWrapper').show();
				} else {
					if (countRankedErrors > 0) {
						this.dataLoaded = 1;
						$('.appStatNotification #notifyMessage').html('<span class="colorError">Something went wrong</span>');
						$('.appStatsLoadingErrorWrapper #statsShow').show();

						$('.appStatLoading .appStatsLoadingErrorText').html('Ranked stats for '+countRankedErrors+' summoner(s) failed');
						$('.appStatWindow .appReload').show();

						$('.appStatLoading .appStatsLoadingProgressWrapper').hide();
						$('.appStatLoading .appStatsLoadingErrorWrapper').show();
					} else {
						this.dataLoaded = 2;
						if (this.stateLoading == 1) {
							this.showHideStates();
						}
						$('.appStatWindow .appReload').show();
						$('.appStatsLoadingErrorWrapper #statsShow').hide();
						$('.appStatLoading .appStatsLoadingProgressWrapper').hide();
						$('.appStatLoading .appStatsLoadingErrorWrapper').hide();
						$('.appStatNotification #notifyMessage').html('<span class="colorReady">Your stats are ready</span>');
					}
				}
				if (this.stateNotify == 0 && this.stateLoading == 0 && this.stateStats == 0) {
					this.showHideStatesForceNotifyOpen();
				}
			}
		}.bind(this), 500);


	} else {
		this.dataLoaded = 1;
		$('.appStatNotification #notifyMessage').html('<span class="colorError">Something went wrong</span>');
		$('.appStatLoading .appStatsLoadingErrorText').html('['+data.content.error.code+'] '+data.content.error.text);
		$('.appStatsLoadingErrorWrapper #statsShow').hide();
		$('.appStatLoading .appStatsLoadingProgressWrapper').hide();
		$('.appStatLoading .appStatsLoadingErrorWrapper').show();
	}	
}

LoLwizOverlay.prototype.updateSummonerRanked = function(summonerId) {
	data = this.rankedData[summonerId];
	champPlayed = data.content.championPlayed;
	if (champPlayed == null) {
		champPlayed = 0;
	}
	champWon = data.content.championWon;
	if (champWon == null) {
		champWon = 0;
	}
	if (champWon == 0 && champPlayed == 0) {
		winProcent = 0;
	} else {
		winProcent = (champWon/champPlayed)*100;
		winProcent = +winProcent.toFixed(0);
	}

	if (data.content.championRolePlayed == 0) {
		$('#data'+summonerId+' .kda').css( { display: 'none' } );
		$('#data'+summonerId+' .wins').css( { display: 'none' } );
		$('#data'+summonerId+' .roles').css( { display: 'none' } );
		$('#data'+summonerId+' .nostats').css( { display: 'inline-block' } );
	} else {
		$('#data'+summonerId+' .kda').css( { display: 'inline-block' } );
		$('#data'+summonerId+' .wins').css( { display: 'inline-block' } );
		$('#data'+summonerId+' .roles').css( { display: 'inline-block' } );
		$('#data'+summonerId+' .nostats').css( { display: 'none' } );
	}

	$('#data'+summonerId+' .games').html(champPlayed);
	$('#data'+summonerId+' .winprocent').html(winProcent+'%');

	$('#data'+summonerId+' .gamesrole').html(data.content.championRolePlayed);
	$('#data'+summonerId+' .rolename').html(data.content.championRole);

	$('#data'+summonerId+' .kills').html(data.content.championKills);
	$('#data'+summonerId+' .death').html(data.content.championDeath);
	$('#data'+summonerId+' .assits').html(data.content.championAssists);

	champPlayed = data.content.championPlayedPast;
	if (champPlayed == null) {
		champPlayed = 0;
	}
	champWon = data.content.championWonPast;
	if (champWon == null) {
		champWon = 0;
	}
	if (champWon == 0 && champPlayed == 0) {
		winProcent = 0;
	} else {
		winProcent = (champWon/champPlayed)*100;
		winProcent = +winProcent.toFixed(0);
	}

	if (data.content.championRolePlayedPast == 0) {
		$('#data'+summonerId+'old .kda').css( { display: 'none' } );
		$('#data'+summonerId+'old .wins').css( { display: 'none' } );
		$('#data'+summonerId+'old .roles').css( { display: 'none' } );
		$('#data'+summonerId+'old .nostats').css( { display: 'inline-block' } );
	} else {
		$('#data'+summonerId+'old .kda').css( { display: 'inline-block' } );
		$('#data'+summonerId+'old .wins').css( { display: 'inline-block' } );
		$('#data'+summonerId+'old .roles').css( { display: 'inline-block' } );
		$('#data'+summonerId+'old .nostats').css( { display: 'none' } );
	}

	$('#data'+summonerId+'old .games').html(champPlayed);
	$('#data'+summonerId+'old .winprocent').html(winProcent+'%');

	$('#data'+summonerId+'old .gamesrole').html(data.content.championRolePlayedPast);
	$('#data'+summonerId+'old .rolename').html(data.content.championRole);

	$('#data'+summonerId+'old .kills').html(data.content.championKillsPast);
	$('#data'+summonerId+'old .death').html(data.content.championDeathPast);
	$('#data'+summonerId+'old .assits').html(data.content.championAssistsPast);

}

LoLwizOverlay.prototype.addSummoner = function(team,summonerId,summonerName,championId,championImage,tier,division,mOffence,mDeffence,mUtility,runes,runesCount,isBot,championName,pastTier) {
	htmlOutput = "";
	htmlOutput += '				<div class="appSummoner" id="data'+summonerId+'">';
	htmlOutput += '					<div class="left">';
	htmlOutput += '						<div class="champion"></div>';
	htmlOutput += '						<div class="champtionname"></div>';
	htmlOutput += '						<div class="tier"><div class="division" style="display: none"></div></div>';
	htmlOutput += '						<div class="tiername"></div>';
	htmlOutput += '						<div class="extendedstats"></div>';
	htmlOutput += '					</div>';
	htmlOutput += '					<div class="right">';
	htmlOutput += '						<div class="summonername"></div>';
//	htmlOutput += '						<div class="seasons">2015 | <div class="past">2014</div></div>';
	htmlOutput += '						<div class="nostats">No ranked stats available</div>';
	htmlOutput += '						<div class="kda">AVG KDA <div class="kills">?</div> <span>|</span> <div class="death">?</div> <span>|</span> <div class="assits">?</div></div>';
	htmlOutput += '						<div class="wins"><div class="games">?</div> games, <div class="winprocent">?</div> wins</div>';
	htmlOutput += '						<div class="roles"><div class="gamesrole">?</div> games as <div class="rolename">?</div></div>';
	htmlOutput += '						<div class="masteries">Masteries <div class="offence">?</div> <span>|</span> <div class="deffence">?</div> <span>|</span> <div class="utility">?</div></div>';
	htmlOutput += '						<div class="runes"><span>-0.56%</span> cooldowns per level<br>(-10.08 at champion level 18)<br><span>+4.02</span> magic resist<br><span>+4.02</span> magic resist<br><span>+24.02</span> armor<br><span>+24.02</span> armor</div>';
	htmlOutput += '					</div>';
	htmlOutput += '					<div class="showMore">...</div>';
	htmlOutput += '				</div>';
/*
	htmlOutput += '				<div class="appSummoner hideIt" id="data'+summonerId+'old">';
	htmlOutput += '					<div class="left">';
	htmlOutput += '						<div class="champion"></div>';
	htmlOutput += '						<div class="champtionname"></div>';
	htmlOutput += '						<div class="tier"></div>';
	htmlOutput += '						<div class="tiername"></div>';
	htmlOutput += '						<div class="extendedstats"></div>';
	htmlOutput += '					</div>';
	htmlOutput += '					<div class="right">';
	htmlOutput += '						<div class="summonername"></div>';
	htmlOutput += '						<div class="seasons"><div class="future">2015</div> | 2014</div>';
	htmlOutput += '						<div class="nostats">No ranked stats available</div>';
	htmlOutput += '						<div class="kda">AVG KDA <div class="kills">?</div> <span>|</span> <div class="death">?</div> <span>|</span> <div class="assits">?</div></div>';
	htmlOutput += '						<div class="wins"><div class="games">?</div> games, <div class="winprocent">?</div> wins</div>';
	htmlOutput += '						<div class="roles"><div class="gamesrole">?</div> games as <div class="rolename">?</div></div>';
	htmlOutput += '						<div class="masteries">Masteries <div class="offence">?</div> <span>|</span> <div class="deffence">?</div> <span>|</span> <div class="utility">?</div></div>';
	htmlOutput += '						<div class="runes"><span>-0.56%</span> cooldowns per level<br>(-10.08 at champion level 18)<br><span>+4.02</span> magic resist<br><span>+4.02</span> magic resist<br><span>+24.02</span> armor<br><span>+24.02</span> armor</div>';
	htmlOutput += '					</div>';
	htmlOutput += '					<div class="showMore">...</div>';
	htmlOutput += '				</div>';
*/	
	if (team == 0) {
		$('.appSummonersTop').append(htmlOutput);
	} else {
		$('.appSummonersBottom').append(htmlOutput);
	}
	$('#data'+summonerId+' .champion').css( { 'background-image': "url('"+championImage+"')" });
	$('#data'+summonerId+' .summonername').html(summonerName);
	$('#data'+summonerId+' .champtionname').html(championName);
	$('#data'+summonerId+' .tier').addClass(tier);
	$('#data'+summonerId+' .tiername').html(tier);
	$('#data'+summonerId+' .past').click( function() {
		$('#data'+summonerId).addClass('hideIt');
		$('#data'+summonerId+'old').removeClass('hideIt');
	});

	$('#data'+summonerId+' .extendedstats').mouseenter( function() {
		$(this).addClass("hover");
	});
	$('#data'+summonerId+' .extendedstats').mouseleave( function() {
		$(this).removeClass("hover");
	});
	if (isBot == 1 || isBot == null ) {
		$('#data'+summonerId+' .extendedstats').hide();
	} else {
		$('#data'+summonerId+' .extendedstats').click( function() {
			statsLink = "http://www.lolking.net/summoner/" + this.region + "/" + summonerId + "#ranked-stats";
			openUrl(statsLink,'lolkingSummoner');
		}.bind(this));
	}
	divisionConverted = romanize(division);
	if (division != '') {
		$('#data'+summonerId+' .division').show();
		$('#data'+summonerId+' .division').html(divisionConverted);
	} else {
		$('#data'+summonerId+' .division').hide();
	}
	$('#data'+summonerId+' .masteries .offence').html(mOffence);
	$('#data'+summonerId+' .masteries .deffence').html(mDeffence);
	$('#data'+summonerId+' .masteries .utility').html(mUtility);
	$('#data'+summonerId+' .runes').html(runes);
	if (runesCount > 6) {
		$('#data'+summonerId+' .showMore').addClass("appEnableShowMore");
		$('#data'+summonerId).mouseenter( function() {
			$(this).addClass("appSummonerHover");
		});
		$('#data'+summonerId).mouseleave( function() {
			$(this).removeClass("appSummonerHover");		
		});
	}

	$('#data'+summonerId+'old .champion').css( { 'background-image': "url('"+championImage+"')" });
	$('#data'+summonerId+'old .summonername').html(summonerName);
	$('#data'+summonerId+'old .champtionname').html(championName);
	$('#data'+summonerId+'old .tier').addClass(pastTier);
	$('#data'+summonerId+'old .tiername').html(pastTier);
	$('#data'+summonerId+'old .future').click( function() {
		$('#data'+summonerId).removeClass('hideIt');
		$('#data'+summonerId+'old').addClass('hideIt');
	});

	$('#data'+summonerId+'old .extendedstats').mouseenter( function() {
		$(this).addClass("hover");
	});
	$('#data'+summonerId+'old .extendedstats').mouseleave( function() {
		$(this).removeClass("hover");
	});
	if (isBot == 1 || isBot == null ) {
		$('#data'+summonerId+'old .extendedstats').hide();
	} else {
		$('#data'+summonerId+'old .extendedstats').click( function() {
			statsLink = "http://www.lolking.net/summoner/" + this.region + "/" + summonerId + "#ranked-stats";
			openUrl(statsLink,'lolkingSummoner');
		}.bind(this));
	}
	$('#data'+summonerId+'old .masteries .offence').html(mOffence);
	$('#data'+summonerId+'old .masteries .deffence').html(mDeffence);
	$('#data'+summonerId+'old .masteries .utility').html(mUtility);
	$('#data'+summonerId+'old .runes').html(runes);
	if (runesCount > 6) {
		$('#data'+summonerId+'old .showMore').addClass("appEnableShowMore");
		$('#data'+summonerId+'old').mouseenter( function() {
			$(this).addClass("appSummonerHover");
		});
		$('#data'+summonerId+'old').mouseleave( function() {
			$(this).removeClass("appSummonerHover");		
		});
	}

}


LoLwizOverlay.prototype.doRankedData = function(data) {
	summonerId = data.content.summonerId;
	summonerName = data.content.summonerName;
	championId = data.content.championId;
	if (data.success) {
			this.timerRanked[summonerId] = 2;
			this.rankedData[summonerId] = data;
			this.updateSummonerRanked(summonerId);
	} else {
			this.timerRanked[summonerId] = 1;
	}
}

LoLwizOverlay.prototype.lookupRankedStats = function(summonerId, summonerName, championId) {
	this.timerRanked[summonerId] = 0;
	this.startRankedStats(summonerId, summonerName, championId);
}

LoLwizOverlay.prototype.startRankedStats = function(summonerId, summonerName, champion) {
	$.ajax({
		url: "http://api.lolwiz.gg/doRankedLookup/" + this.region + "/" + champion + "/" + summonerId + "/" + summonerName,
		type: 'GET',
		success: function (data) {
			var apijson = $.parseJSON(data);
			this.doRankedData(apijson);

		}.bind(this),
		error: function (data) {
			gameData = { success: false, content: { summonerId: summonerId, summonerName: summonerName, championId: champion, error: { code: 101, message: 'Communication with the Riot API failed' } } };
			this.doRankedData(gameData);
		}.bind(this)
	});
}


$(document).ready( function () {
	var appOverlay = new LoLwizOverlay();
	appOverlay.init();


});