// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

var shibCookie = Ti.App.Properties.getString("shibCookie", "");
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
	//Ti.API.info(loginWindow.visible);
	if (loginWindow.visible) {
		detailNav.close(loginWindow);
	}
	//
	//detailNav.open(idpsListWindow);
	for (var i=0; i<e.rowData.idps.length; i++) {
			idpsData[i] = {title: e.rowData.idps[i].displayName, origin: e.rowData.idps[i].origin, hasChild: true}
	}
	idpsTableView.setData(idpsData);
});

idpsTableView.addEventListener('click', function(e) {
	
	var login_url = "https://gridp.ct.infn.it/ds/WAYF?entityID=https://indicate-gw.consorzio-cometa.it/shibboleth&action=selection&origin=";
	//idpsListWindow.setTitle("Back");
	detailNav.open(loginWindow);
	loginWindow.setTitle(e.rowData.title);
	loginWindow.backButtonTitle = 'Back'
	//loginWindow.leftNavButton = Titanium.UI.createButton({title:'Back'});
	//Ti.API.info(e.rowData.origin);
	wv.url = login_url + e.rowData.origin;
	
});


var loginSplitWindow = Ti.UI.iPad.createSplitWindow({
	masterView: masterNav,
	detailView: detailNav,
	/*
	orientationModes : [
			Titanium.UI.LANDSCAPE_LEFT,
			Titanium.UI.LANDSCAPE_RIGHT,
		]*/
	
});

loginSplitWindow.addEventListener('visible',function(e)
{
    if (e.view == 'detail')
    {
        e.button.title = "Federations";
        idpsListWindow.leftNavButton = e.button;
    }
    else if (e.view == 'master')
    {
        idpsListWindow.leftNavButton = null;
    }
});




var loginWindow = Ti.UI.createWindow({
	//modal:true,
	backgroundColor: "white"
});


var loadingInd = Ti.UI.createActivityIndicator({
	style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK,
	color: "black",
	width: "200",
	height: "80",
	bottom: 20,
	message: "Loading...",
	font: {fontFamily: "Helvetica Neue", fontSize: 26, fontFamily: "bold"}
});


var wv = Ti.UI.createWebView();
loginWindow.add(loadingInd);
loginWindow.add(wv);

wv.addEventListener('beforeload', function() {
	Ti.API.info("beforeload");
	loadingInd.show();
	if(!firstLoad) {
		this.hide();
	}
});

wv.addEventListener('load', function(e) {
	Ti.API.info("into load event");
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
					Ti.App.Properties.setString("shibCookie", shibCookie);
					loginSplitWindow.close();
					apiCall(shibCookie, "https://indicate-gw.consorzio-cometa.it/glibrary/login/", function(response) {
						Ti.API.info("logged in");
						alert("logged as " + response.cn);
						userInfoLabel.text = "Logged as: "  + response.cn;
					});
					
					mainSplitWindow.open();
					break;
				}
			}
		} else {
			this.show();
		}
	}
});


var repositoryWindow = Ti.UI.createWindow({
	backgroundColor: "white",
	bottom: 50
});



var browserWindow = Ti.UI.createWindow({
	backgroundColor: "white"
});


var repoNav = Ti.UI.iPhone.createNavigationGroup({
	window: repositoryWindow
});

var browserNav = Ti.UI.iPhone.createNavigationGroup({
	window: browserWindow
});

var mainSplitWindow = Ti.UI.iPad.createSplitWindow({
	masterView: repoNav,
	detailView: browserNav,
	orientationModes : [
			Titanium.UI.LANDSCAPE_LEFT,
			Titanium.UI.LANDSCAPE_RIGHT,
		]
});

var userInfoView = Ti.UI.createView({
	bottom:0,
	left:0,
	//width:250,
	height:50,
	//borderWidth:1,
	borderColor: "gray",
	backgroundColor: "gray"
});

var userInfoLabel = Ti.UI.createLabel({
	width:"auto",
	height: "auto" 
});

userInfoView.add(userInfoLabel);

repoNav.add(userInfoView);

var repoListTableView = Ti.UI.createTableView();
repositoryWindow.add(repoListTableView);

if (shibCookie === "")
	loginSplitWindow.open();
else {
	apiCall(shibCookie, "https://indicate-gw.consorzio-cometa.it/glibrary/login/", function(response) {
		userInfoLabel.text = "Logged as: " + response.cn;
	}); 
	apiCall(shibCookie, "http://glibrary.ct.infn.it/glibrary_new/indicate/repos.json", function(response) {
		var data = [];
		for (var i=0; i < response.length; i++) {
			var repo = {};
			repo.title = response[i].rep_name;
			repo.hasChild = true;
			repo.name = response[i].repository;
			repo.leftImage = response[i].thumb;
			data.push(repo);
		}
		repositoryWindow.title = "Repositories"
		repoListTableView.setData(data);
	});
	mainSplitWindow.open();
}

typesWindow = Ti.UI.createWindow({
	backgroundColor: "white"
});

typesTableView = Ti.UI.createTableView();
typesWindow.add(typesTableView);




repoListTableView.addEventListener('click', function(e) {
	apiCall(shibCookie, "https://indicate-gw.consorzio-cometa.it/glibrary/mountTree/" + e.rowData.name + "/?node=0", function(response) {
		Ti.API.info(response);
		var data = [];
		for (var i=0; i < response.length; i++) {
			var type = {};
			type.title = response[i].text;
			type.isLeaf = response[i].leaf;
			type.name = String(response[i].id);
			type.leftImage = "Folder-Add.png";
			if (!type.isLeaf) {
				apiCall(shibCookie, "https://indicate-gw.consorzio-cometa.it/glibrary/mountTree/" + e.rowData.name + "/?node=" + response[i].id, function(response) {
					Ti.API.info(response);
					for (var j=0; j < response.length; j++) {
							var row = Ti.UI.createTableViewRow();
							row.add(Ti.UI.createLabel({
								text: response[j].text,
								left: 100,
								font: {fontSize: 18}	
							}));
							row.add(Ti.UI.createImageView({
								image: "folder.png",
								width: 50,
								left: 50
							}));
							row.name = "" + response[j].id;
							row.path = response[j].path;
							row.hasChild = true;
							var previousRow = typesTableView.getIndexByName(type.name);
							typesTableView.insertRowAfter(previousRow, row);
					}
				});
			}
			type.path = response[i].path;
			type.hasChild = true;
			//typesTableView.appendRow(type);
			data.push(type);
		}
		typesTableView.setData(data);
		repoNav.open(typesWindow);
	});
	
	
	
});

function apiCall(cookie, url, _callback) {
	//Ti.API.info(url);
	var xhr = Ti.Network.createHTTPClient();
	xhr.onload = function() {
		//Ti.API.info(this.responseText);
		if (this.responseText.indexOf("<title>Access System Failure</title>") != -1) {
			mainSplitWindow.close();
			loginSplitWindow.open();
		} else {
			var response = JSON.parse(this.responseText);
			//Ti.API.info(response);
			_callback(response);
		}
	};
	xhr.onerror = function(e) {
		alert(e);
	}
	xhr.open('GET', url);
	xhr.setRequestHeader("Cookie", cookie);
	xhr.send();
}
