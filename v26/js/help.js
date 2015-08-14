
function LoLwizHelp() {

}

LoLwizHelp.prototype.init = function() {
	this.initEvents();
	this.build();
};
LoLwizHelp.prototype.initEvents = function() {
	window.addEventListener('storage', function( storageEvent ){

		storageValue = JSON.parse( storageEvent.newValue );

		switch( storageEvent.key ){ 
			case 'lolwizCommandHelpToggle':
				this.toggleVisibility();
				break;

		}

	}.bind(this), false);
};

LoLwizHelp.prototype.toggleVisibility = function() {
	overwolf.windows.getCurrentWindow (function(result) {
		if (result.status == "success"){
			if(result.window.isVisible){
				overwolf.windows.minimize(result.window.id, null);
			}
			else {
				_gaq.push(['_trackPageview', 'v26/help/']);
				overwolf.windows.restore(result.window.id, null);
			}
		}
	}.bind(this));
};
LoLwizHelp.prototype.build = function() {
	htmlOutput = "";
	htmlOutput += '<div class="appBorder">';
	htmlOutput += '	<div class="appBox">';
	htmlOutput += '		<div class="itemLogo"></div>';
	htmlOutput += '		<div class="appHelpText">Need Help?</div>';
	htmlOutput += '		<div class="appHelpLinks">Check out our <a href="javascript:openUrl(\'https://www.youtube.com/watch?v=PENLTgnbe5U&list=PLWfbfX_O71SQ648o__MDTC5pmSh8QaANz&autoplay=1\',\'videoTutorial\');">video tutorial</a></div>';
	htmlOutput += '		<div class="appHelpLinks">Got Feedback? Visit <a href="javascript:openUrl(\'http://feedback.lolwiz.gg\',\'feedbackLink\');">feedback.lolwiz.gg</a></div>';
	htmlOutput += '		<div class="appHelpText">Extended game stats by...</div>';
	htmlOutput += '		<div class="appHelpCreditsLolking"><a href="javascript:openUrl(\'http://www.lolking.net\',\'creditLolking\');"><div class="appLolkingLogo"></div></a></div>';

	htmlOutput += '		<div class="appHelpTextTop">Hotkeys</div>';
	htmlOutput += '		<div class="appHelpShortcut"><div class="highlight shortcutLong">SHFT+TAB</div>| Toggle LoLwiz overlay</div>';
	htmlOutput += '		<div class="appHelpShortcut"><div class="highlight shortcutLong">CTRL+SHFT+B</div>| In-Game Browser</div>';
	htmlOutput += '		<div class="appHelpShortcut"><div class="highlight shortcutLong">CTRL+SHFT+S</div>| In-Game Multi IM</div>';
	htmlOutput += '		<div class="appHelpShortcut"><div class="highlight shortcutLong">CTRL+SHFT+C</div>| In-Game Chat</div>';
	htmlOutput += '		<div class="appHelpShortcut"><div class="highlight shortcutLong">CTRL+SHFT+P</div>| Toggle FPS</div>';
	htmlOutput += '		<div class="appHelpShortcut"><div class="highlight shortcutLong">F10</div>| Start Video Capture</div>';
	htmlOutput += '		<div class="appHelpShortcut"><div class="highlight shortcutLong">F11</div>| Take Screenshot</div>';
	htmlOutput += '		<div class="appHelpText">Brought to you by...</div>';
	htmlOutput += '		<div class="appHelpCredits">Florence <span class="highlight">NiKiT&#214;</span> Espinoza | Project Lead</div>';
	htmlOutput += '		<div class="appHelpCredits">Thomas <span class="highlight">Tastefull</span> Hansen | Developer</div>';
	htmlOutput += '		<div class="appHelpText">Honorable mentions...</div>';
	htmlOutput += '		<div class="appHelpCredits">Robert <span class="highlight">MrRandom</span> Maloney | Developer</div>';
	htmlOutput += '		<div class="appHelpCredits">Lulu <span class="highlight">PixuLuLu</span> Younes | Graphics & UI</div>';
	htmlOutput += '		<div class="appHelpSpacer"></div>';
	htmlOutput += '	</div>';
	htmlOutput += '</div>';
	htmlOutput += '<div class="appClose"></div>';

	$('#help').append(htmlOutput);
	commandTrigger('lolwizCommandHelpReady');


	$('.appClose').click( function() {
		this.closeWindow();
	}.bind(this));

	$('.appBox').mousedown( function() {
		this.dragWindow();
	}.bind(this));

};

LoLwizHelp.prototype.dragWindow = function() {
	overwolf.windows.getCurrentWindow (function(result) {
		if (result.status == "success"){
			overwolf.windows.dragMove(result.window.id);
		}			
	}.bind(this));
};

LoLwizHelp.prototype.closeWindow = function() {
	this.toggleVisibility();
};


$(document).ready( function () {
	var appHelp = new LoLwizHelp();
	appHelp.init();


});