
function LoLwizBrowser() {
	this.link = "";
	this.addlink = "";
	this.champion = "";
	this.championid = 0;
	this.summonername = "";
	this.region = "";
	this.bookmarks = [];
	this.sponsorSummoner = [ 
		{ url: 'http://www.lolking.net/search?name=###summonername###&region=###region###', name: 'http://lolking.net' } 
	];
	this.sponsorChampion = [ 
		{ url: 'http://www.lolking.net/guides/list.php?champion=###championname###', name: 'LoL King' }
//		{ url: 'http://www.probuilds.net/champions/###championname###', name: 'Probuilds' }
//		,
//		{ url: 'http://www.mobafire.com/league-of-legends/champion/###championname###-###championid###', name: 'Mobafire' }
	];
}

LoLwizBrowser.prototype.init = function() {
	window.addEventListener('storage', function( storageEvent ){
		storageValue = JSON.parse( storageEvent.newValue );

		switch( storageEvent.key ){ 
			case 'lolwizCommandBrowserToggle':
				this.toggleVisibility();
				break;
				
			case 'lolwizLink':
				this.changeLink(storageValue.link);
				break;
				
			case 'lolwizOwnChampion':
				this.champion = storageValue.champion;
				this.championid = storageValue.championid;
				this.createSponsored();
				break;
				
			case 'lolwizConfig':
				this.summonername = storageValue.summonername;
				this.region = storageValue.region;
				this.createSponsored();
				break;

			case 'lolwizBookmarks':
				this.bookmarks = storageValue.bookmarks;
				break;

		}

	}.bind(this), false);


	var baseLink = "{\"link\":\"\"}";
	try {
		config = localStorage.getItem("lolwizLink");
		if (typeof(config) === "undefined" || config == null || config == 'null') {
			config = $.parseJSON(baseLink);
		} else {
			config = $.parseJSON(config);
		}
	} catch (err) {
		config = $.parseJSON(baseLink);
	}
	var baseChampion = "{\"champion\":\"\", \"championid\":\"0\", \"guid\": \"\" }";
	try {
		configChampion = localStorage.getItem("lolwizOwnChampion");
		if (typeof(configChampion) === "undefined" || configChampion == null || configChampion == 'null') {
			configChampion = $.parseJSON(baseChampion);
		} else {
			configChampion = $.parseJSON(configChampion);
		}
	} catch (err) {
		configChampion = $.parseJSON(baseChampion);
	}
	var baseConfig = "{\"champion\":\"\", \"guid\": \"\" }";
	try {
		configSummoner = localStorage.getItem("lolwizConfig");
		if (typeof(configSummoner) === "undefined" || configSummoner == null || configSummoner == 'null') {
			configSummoner = $.parseJSON(baseConfig);
		} else {
			configSummoner = $.parseJSON(configSummoner);
		}
	} catch (err) {
		configSummoner = $.parseJSON(baseConfig);
	}
	this.loadBookmarks();
	
	this.link = config.link;
	this.champion = configChampion.champion;
	this.championid = configChampion.championid;
	this.summonername = configSummoner.summonername;
	this.region = configSummoner.region;
	this.build();
};

LoLwizBrowser.prototype.toggleVisibility = function() {
	overwolf.windows.getCurrentWindow (function(result) {
		if (result.status == "success"){
			if(result.window.isVisible){
				overwolf.windows.minimize(result.window.id, null);
			}
			else {
				_gaq.push(['_trackPageview', 'v26/bookmarks/']);
				overwolf.windows.restore(result.window.id, null);
			}
		}
	}.bind(this));
};

LoLwizBrowser.prototype.loadBookmarks = function() {
	var baseUserBookmarks = "{\"bookmarks\": [ ]}";
	try {
		configUserBookmarks = localStorage.getItem("lolwizBookmarks");
		if (typeof(configUserBookmarks) === "undefined" || configUserBookmarks == null || configUserBookmarks == 'null') {
			configUserBookmarks = $.parseJSON(baseUserBookmarks);
		} else {
			configUserBookmarks = $.parseJSON(configUserBookmarks);
		}
	} catch (err) {
		configUserBookmarks = $.parseJSON(baseUserBookmarks);
	}
	this.bookmarks = configUserBookmarks.bookmarks;
}
LoLwizBrowser.prototype.build = function() {

	htmlOutput = "";
	htmlOutput += '<div class="appBorder">';
	htmlOutput += '	<div class="appBox">';
	htmlOutput += '		<div class="appBrowserDragTop">';
	htmlOutput += '			<div class="itemLogo"></div>';
	htmlOutput += '			<div class="itemLink"><input type="text" class="searchInput" value="'+this.link+'" placeholder="Paste your URL here and press the Add Bookmark button"></div>';
	htmlOutput += '			<div class="itemAddBookmark"><input type="button" value="ADD BOOKMARK"></div>';
	htmlOutput += '			<div class="appSponsoredBookmarks">';
	htmlOutput += '				<div class="headline">LOLKING BUILDS AND SUMMONER LINKS</div>';
	htmlOutput += '				<div class="sponsoredlinks"></div>';
	htmlOutput += '			</div>';
	htmlOutput += '			<div class="appUserBookmarks">';
	htmlOutput += '				<div class="headline">USER BOOKMARKS</div>';
	htmlOutput += '				<div class="userlinks"></div>';
	htmlOutput += '			</div>';
	htmlOutput += '		</div>';
	htmlOutput += '		<div class="appBrowserDragLeft"></div>';
	htmlOutput += '		<div class="appBrowserDragRight"></div>';
	htmlOutput += '		<div class="appBrowserDragBottom"></div>';
	htmlOutput += '	</div>';
	htmlOutput += '</div>';
	htmlOutput += '<div class="appClose"></div>';

	$('#browser').append(htmlOutput);
	commandTrigger('lolwizCommandBrowserReady');

	
	this.updateLinkIcon();

	$('.userlinks').niceScroll({cursorcolor:"#3CAAFF",cursorborder:"0 solid #3CAAFF",cursoropacitymax:0.56,railpadding:{top:0,right:2,left:0,bottom:0},horizrailenabled:false});

	$('.appClose').click( function() {
		this.closeWindow();
	}.bind(this));

	$('.appBrowserDragTop, .appBrowserDragLeft, .appBrowserDragRight, .appBrowserDragBottom').mousedown( function() {
		this.dragWindow();
	}.bind(this));
	$('.searchInput, .itemGo, .itemAddBookmark').mousedown( function( event ) {
		event.stopPropagation()
	});
	$('.itemGo').click( function( event ) {
		event.stopPropagation();
		this.link = $('.searchInput').val();
		if (!this.link.match(/^[a-zA-Z]+:\/\//)) {
			this.link = 'http://' + this.link;
		}
		this.changeLink(this.link);
	}.bind(this));
	$(".searchInput").keyup(function(e){ 
		var code = e.which;
		if(code==13)e.preventDefault();
		if(code==13){
			this.link = $('.searchInput').val();
			if (!this.link.match(/^[a-zA-Z]+:\/\//)) {
				this.link = 'http://' + this.link;
			}
			this.changeLink(this.link);
		}
	}.bind(this));
	$('.itemAddBookmark').click( function( event ) {
		event.stopPropagation();
		this.addlink = $('.searchInput').val();
		if (!this.addlink.match(/^[a-zA-Z]+:\/\//)) {
			this.addlink = 'http://' + this.addlink;
		}
		this.addBookmark(this.addlink);
	}.bind(this));
	$('.itemShowBookmark').click( function( event ) {
		event.stopPropagation();
		this.showHideBrowser();
	}.bind(this));
	
	this.createSponsored();
	this.createUserBookmarks();
	if (this.link != '') {
		this.showHideBrowser();
	}
};

LoLwizBrowser.prototype.showHideBrowser = function() {
	isVisible = $( "#appBrowser" ).is( ":visible" );
	if (isVisible) {
		$('#appBrowser').hide();
		$('.appBrowserDragTop').css( { height: '674px' } );
	} else {
		$('.appBrowserDragTop').css( { height: '47px' } );
		$('#appBrowser').show();
	}
}
LoLwizBrowser.prototype.createSponsored = function() {
	$('.sponsoredlinks').empty();
	if (this.championid > 0) {
		championNameClean = this.champion.replace(/[^a-z0-9]/ig, '');
		championNameClean = championNameClean.toLowerCase();
		for (var item in this.sponsorChampion) {
			url = this.sponsorChampion[item].url;
			url = url.replace('###championname###', championNameClean);
			url = url.replace('###championid###', this.championid);
			proxyurl = "http://api.lolwiz.gg/getPageTitle.php?u=" + url
			$.ajax({
				url: proxyurl,
				async: true,
				success: function(data) {
					var apijson = $.parseJSON(data);
					this.addSponsored(apijson.url,apijson.title);
				}.bind(this)
			});
		}
	}
	if (this.summonername != '' || typeof(this.summonername) === "undefined") {
		summonerNameClean = this.summonername.toLowerCase();
		for (var item in this.sponsorSummoner) {
			url = this.sponsorSummoner[item].url;
			url = url.replace('###summonername###', summonerNameClean);
			url = url.replace('###region###', this.region);
			this.addSponsored(url,this.summonername + '\'s - Personal Stats @ ' + this.sponsorSummoner[item].name);
		}
	}
	if (this.championid == 0 && this.summonername == '') {
		$('.sponsoredlinks').append('No sponsored bookmarks was found');
	}
}
LoLwizBrowser.prototype.createUserBookmarks = function() {
	$('.userlinks').empty();
	if (this.bookmarks.length > 0) {
		for (var item in this.bookmarks) {
			this.addUserBookmark(this.bookmarks[item].url,this.bookmarks[item].title);
		}
	}
	if (this.bookmarks.length == 0) {
		$('.userlinks').append('No user bookmarks was found');
	}
}

LoLwizBrowser.prototype.addSponsored = function(url,title) {
	htmlOutput = "";
	htmlOutput += '<div class="itemUrl" style="background-image: url(\'http://www.google.com/s2/favicons?domain='+url+'\')"><a href="#" class="itemUrlLink">'+title+'<input type="hidden" value="'+url+'"></a></div>';
	$('.sponsoredlinks').append(htmlOutput);
	thisObj = this;
	$('.itemUrlLink').unbind('click').bind('click', function() {
		openUrl($(this).children('input').val(),'bookmarklink');
	});
	$('.itemUrlLink').mouseenter( function() {
		$(this).addClass('hover');
	});
	$('.itemUrlLink').mouseleave( function() {
		$(this).removeClass('hover');
	});
}
LoLwizBrowser.prototype.addUserBookmark = function(url,title) {
	htmlOutput = "";
	htmlOutput += '<div class="itemUrl" style="background-image: url(\'http://www.google.com/s2/favicons?domain='+url+'\')"><a href="#" class="itemUrlLink">'+title+'<div class="itemDelete"></div><input type="hidden" value="'+url+'"></a></div>';
	$('.userlinks').append(htmlOutput);
	thisObj = this;
	$('.itemUrlLink').unbind('click').bind('click', function() {
		openUrl($(this).children('input').val(),'bookmarklink');
	});
	$('.itemUrlLink').mouseenter( function() {
		$(this).addClass('hover');
	});
	$('.itemUrlLink').mouseleave( function() {
		$(this).removeClass('hover');
	});
	$('.itemUrl').mouseenter( function() {
		$(this).addClass('hover');
	});
	$('.itemUrl').mouseleave( function() {
		$(this).removeClass('hover');
	});
	$('.itemUrlLink').children('.itemDelete').unbind('click').bind('click', function() {
		thisObj.deleteBookmark($(this).parent('.itemUrlLink').children('input').val());
	});
}

LoLwizBrowser.prototype.addBookmark = function(url) {
	foundUrl = 0;
	for (var item in this.bookmarks) {
		if (url == this.bookmarks[item].url) {
			foundUrl = 1;
		}
	}
	if (foundUrl == 0) {
		proxyurl = "http://api.lolwiz.gg/getPageTitle.php?u=" + url
		$.ajax({
			url: proxyurl,
			async: true,
			success: function(data) {
				var apijson = $.parseJSON(data);
				this.saveBookmark(apijson.url,apijson.title);
			}.bind(this)
		});
	}
}

LoLwizBrowser.prototype.deleteBookmark = function(url) {
	for (var item in this.bookmarks) {
		if (url == this.bookmarks[item].url) {
			delete this.bookmarks[item];
			this.bookmarks.splice( item, 1 );
		}
	}
	dataSave = { bookmarks: this.bookmarks };
	localStorage.setItem("lolwizBookmarks", JSON.stringify(dataSave));
	this.createUserBookmarks();
}
LoLwizBrowser.prototype.saveBookmark = function(url,title) {
	if (title != null) {
		data = { url: url, title: title };
		this.bookmarks.push(data);
		dataSave = { bookmarks: this.bookmarks };
		localStorage.setItem("lolwizBookmarks", JSON.stringify(dataSave));
		this.createUserBookmarks();
		$('.appBrowserDragTop').css( { height: '674px' } );
		$('#appBrowser').hide();
	}
}
LoLwizBrowser.prototype.updateLinkIcon = function() {
	if (this.link != '') {
		$('.searchInput').css( { "background-image": "url('http://www.google.com/s2/favicons?domain="+this.link+"')" } );
	} else {
//		$('.searchInput').css( { "background-image": "url('http://www.leagueoflegends.dk/lolwiz_v26/images/icon_browser_16x16.png')" } );
	}
}
LoLwizBrowser.prototype.changeLink = function(url) {
/*
	$('.appBrowserDragTop').css( { height: '47px' } );
	$('#appBrowser').show();
	this.link = url;
	this.updateLinkIcon();
	$('.searchInput').val(this.link); 
	$('#appBrowser').attr('src',this.link); 
*/
}


LoLwizBrowser.prototype.dragWindow = function() {
	overwolf.windows.getCurrentWindow (function(result) {
		if (result.status == "success"){
			overwolf.windows.dragMove(result.window.id);
		}			
	}.bind(this));
};

LoLwizBrowser.prototype.closeWindow = function() {
	this.toggleVisibility();
};


$(document).ready( function () {
	var appBrowser = new LoLwizBrowser();
	appBrowser.init();


});