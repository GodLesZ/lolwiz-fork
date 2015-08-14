
function createGuid() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				   .toString(16)
				   .substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
				   s4() + '-' + s4() + s4() + s4();
}
function openUrl(url,statinfo) {
	_gaq.push(['_trackPageview', 'v26/external/link/'+statinfo]);
	if (statinfo == 'bookmarklink') {
		statinfo = "_blank";
	}
	window.open(url,statinfo,null,false);
	console.log(url);
/*
	var guid = createGuid();
	data = { link: url, random: guid }
	localStorage.setItem("lolwizLink", JSON.stringify(data));
*/
}
function commandTrigger(storage) {
	var guid = createGuid();

	data = { random: guid }
	localStorage.setItem(storage, JSON.stringify(data));
}
function setChampion(champion,id) {
	var guid = createGuid();

	data = { champion: champion, championid: id, random: guid }
	localStorage.setItem("lolwizOwnChampion", JSON.stringify(data));
}
function romanize (num) {
    if (!+num)
        return false;
    var digits = String(+num).split(""),
        key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
               "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
               "","I","II","III","IV","V","VI","VII","VIII","IX"],
        roman = "",
        i = 3;
    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}

