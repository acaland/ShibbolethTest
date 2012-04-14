// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

var shibCookie = "";
var firstLoad = true;

// prova2
//var url = "https://glibrary.ct.infn.it/secure/view.php?all_variables";
var login_url = "https://gridp.ct.infn.it/ds/WAYF?entityID=https://liferay.ct.infn.it/shibboleth&action=selection&origin=https://idp.ct.infn.it/idp/shibboleth";

var url = "https://liferay.ct.infn.it/glibrary/time/";

var url2 = "https://liferay.ct.infn.it/glibrary/getTree/deroberto/";
var win = Ti.UI.createWindow({
	backgroundColor : "white",
});


var loginWin = Ti.UI.createWindow({
	modal:true,
	backgroundColor: "white"
});


var loadingInd = Ti.UI.createActivityIndicator({
	style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK,
	width: "auto",
	height: "auto",
	message: "Loading...",
	font: {fontFamily: "Helvetica Neue", fontSize: 26, fontFamily: "bold"}
});


var wv = Ti.UI.createWebView({
	url : login_url,
	//borderWidth : 10,
	//borderRadius : 5,
	//height : 550,
	//width : 1024,
	//borderColor : "gray"
});

loginWin.add(wv);

wv.addEventListener('beforeload', function() {
	Ti.API.info("beforeload");
	loadingInd.show();
	if(!firstLoad) {
		this.hide();
	}
});

wv.addEventListener('load', function(e) {
	loadingInd.hide();
	if(firstLoad) {
		firstLoad = false;
	} else {	
		Ti.API.info('check cookies');
		var raw_cookies = this.evalJS("document.cookie");
		if(raw_cookies.indexOf("_shibsession_") != -1) {
			
			var cookies = raw_cookies.split(";");
			for( i = 0; i <= cookies.length - 1; i++) {
				Ti.API.info("cookie -> " + cookies[i]);
				if(cookies[i].indexOf("_shibsession_") != -1) {
					shibCookie = cookies[i];
					Ti.API.info("Shibboleth Session: " + shibCookie);
					getRepoButtons.visible = true;
					getStoragesButton.visible = true;
					loginBtn.visible = false;
					loginWin.close();
					break;
				}
			}
		} else {
			this.show();
		}
	}
});

var loginBtn = Ti.UI.createButton({
	title : "Login",
	width : 100,
	height : 70,
	top : 30
});

loginBtn.addEventListener("click", function() {
	//win.add(wv);
	loginWin.open();
})
var getRepoButtons = Ti.UI.createButton({
	title : "get DeRoberto tree",
	width : 160,
	height : 70,
	top : 140,
	visible : false
});

getRepoButtons.addEventListener("click", function() {
	apiCall(shibCookie, url2);
});
var getStoragesButton = Ti.UI.createButton({
	title : "get Storages",
	width : 160,
	height : 70,
	top : 240,
	visible : false
})

getStoragesButton.addEventListener("click", function() {
	apiCall(shibCookie, "http://liferay.ct.infn.it/decide/storages/3");
})

win.add(loginBtn);
win.add(getRepoButtons);
win.add(getStoragesButton);

win.open();

function apiCall(cookie, url) {

	var xhr = Ti.Network.createHTTPClient();
	xhr.onload = function() {
		alert(this.responseText);
	};
	xhr.open('GET', url);
	xhr.setRequestHeader("Cookie", cookie);
	xhr.send();
}
