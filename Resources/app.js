// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

var shibCookie = "";
var firstLoad = true;



var federationsWindow = Ti.UI.createWindow({
	backgroundColor: "white",
	title: "Federations"
});

var federationsTableView = Ti.UI.createTableView({
	allowsSelection:true
});
federationsWindow.add(federationsTableView);


var masterNav = Ti.UI.iPhone.createNavigationGroup({
	window:federationsWindow
});

var idpSearchBar = Titanium.UI.createSearchBar({
	showCancel:false
});

var idpsListWindow = Ti.UI.createWindow({
	backgroundColor: "white",
	title: "Select your identity provider"
});

var idpsTableView = Ti.UI.createTableView({
	search: idpSearchBar,
	filterAttribute: 'title'
});

idpsListWindow.add(idpsTableView);

var detailNav = Ti.UI.iPhone.createNavigationGroup({
	window: idpsListWindow
});

var net = require("services/net");
net.retrieveIdpList("https://indicate-gw.consorzio-cometa.it/shibboleth", function(federations) {
	var federationData = [];
	federationData[0] = {title: "All", hasChild: true}
	federationData[0].idps = [];
	for (var i=0; i < federations.length; i++) {
		federationData[0].idps = federationData[0].idps.concat(federations[i].idps);
		federationData[i+1] ={title: federations[i].name, idps: federations[i].idps, hasChild: true};
	}
	federationData[0].idps.sort(function(a, b) {
 		var nameA=a.displayName.toLowerCase(), nameB=b.displayName.toLowerCase();
 		if (nameA < nameB) //sort string ascending
  			return -1; 
 		if (nameA > nameB)
  			return 1;
 		return 0; //default return value (no sorting)
	});
	federationsTableView.setData(federationData);
	federationsTableView.selectRow(0);
	federationsTableView.fireEvent('click', {rowData:federationData[0]});
});

federationsTableView.addEventListener('click', function(e) {
	var idpsData = [];
	for (var i=0; i<e.rowData.idps.length; i++) {
			idpsData[i] = {title: e.rowData.idps[i].displayName, origin: e.rowData.idps[i].origin, hasChild: true}
	}
	idpsTableView.setData(idpsData);
	
	
});

var loginSplitWindow = Ti.UI.iPad.createSplitWindow({
	masterView: masterNav,
	detailView: detailNav,
	orientationModes : [
		Titanium.UI.LANDSCAPE_LEFT,
		Titanium.UI.LANDSCAPE_RIGHT,
	]
});


loginSplitWindow.open();



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

//win.open();

function apiCall(cookie, url) {

	var xhr = Ti.Network.createHTTPClient();
	xhr.onload = function() {
		alert(this.responseText);
	};
	xhr.open('GET', url);
	xhr.setRequestHeader("Cookie", cookie);
	xhr.send();
}
