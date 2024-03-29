// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

var shibCookie = Ti.App.Properties.getString("shibCookie", "");
var firstLoad = true;
var loggedIn = false;
var currentRepo = "";
var currentUser = "";
var gateway = "https://earthserver-sg.consorzio-cometa.it";
//var gateway = "https://indicate-gw.consorzio-cometa.it";
//var gateway = "applications.eu-decide.eu";


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
//net.retrieveIdpList("https://indicate-gw.consorzio-cometa.it/shibboleth", function(federations) {
net.retrieveIdpList(gateway +"/shibboleth", function(federations) {
	//Ti.API.info("federations:");
	//Ti.API.info(federations);
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
	
	var login_url = "https://gridp.garr.it/ds/WAYF?entityID="+ gateway + "/shibboleth&action=selection&origin=";
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
	//bottom: 20,
	message: "Loading...",
	font: {fontFamily: "Helvetica Neue", fontSize: 26, fontFamily: "bold"}
});


var wv = Ti.UI.createWebView();
loginWindow.add(loadingInd);
loginWindow.add(wv);

/*wv.addEventListener('beforeload', function(e) {
	Ti.API.info(e.navigationType);
	//Ti.API.info("beforeload");
	Ti.API.info(e.url);
	//var cookies = wv.evalJS("document.cookie").split(";"); 
    //Ti.API.info( "# of cookies -> " + cookies.length  );
    for (i = 0; i <= cookies.length - 1; i++) {
            Ti.API.info( "cookie -> " + cookies[i] );
    }
	//loadingInd.show();
	//if(!firstLoad) {
	//	this.hide();
	//}
}); */

var net = require('services/net');

wv.addEventListener('load', function(e) {
	
	//Ti.API.info("into load event");
	Ti.API.info("Loaded: " + e.url);
	//Ti.API.info(JSON.stringify(wv.getCookiesForURL(e.url)));
	//loadingInd.hide();
	if (firstLoad || loggedIn) {
		firstLoad = false;
	} else {	
		Ti.API.info('check cookies');
		var raw_cookies = wv.evalJS("document.cookie");
		Ti.API.info("cookie: " + raw_cookies);
		if(raw_cookies.indexOf("_shibsession_") != -1) {
			Ti.API.info("ho trovato shibsession");
			var cookies = raw_cookies.split(";");
			for( i = 0; i <= cookies.length - 1; i++) {
				Ti.API.info("cookie -> " + cookies[i]);
				if(cookies[i].indexOf("_shibsession_") != -1) {
					shibCookie = cookies[i];
					Ti.API.info("Shibboleth Session:" + shibCookie);
					Ti.App.Properties.setString("shibCookie", shibCookie);
					net.setCookie(shibCookie);
					loginSplitWindow.close();
					
					apiCall(shibCookie, gateway + "/api/login/", function(response) {
											Ti.API.info("logged in");
											//alert("logged as " + response.cn);
											currentUser = response.cn;
											userInfoLabel.text = "Logged as: "  + response.cn;
											Ti.API.info(currentUser);
										});
					loggedIn = true;
					
					mainSplitWindow.open();
					populateRepos();
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
	height: "auto",
	left: 10
});

var logoutBtn = Ti.UI.createButton({
	title: "Log out",
	width: 80,
	height: 30,
	right: 10
})

logoutBtn.addEventListener('click', function() {
	mainSplitWindow.close();
	wv.evalJS("document.cookie="+shibCookie+"'; expires=Thu, 01-Jan-70 00:00:01 GMT;';");
	Ti.API.info(wv.evalJS("document.cookie"));
	shibCookie == "";
	Ti.App.Properties.setString("shibCookie", "");
	loggedIn = false;
	loginSplitWindow.open();
});

userInfoView.add(logoutBtn);
userInfoView.add(userInfoLabel);

repoNav.add(userInfoView);

var repoListTableView = Ti.UI.createTableView();
repositoryWindow.add(repoListTableView);

var itemBrowserTableView = Ti.UI.createTableView();
browserWindow.add(itemBrowserTableView);

function populateRepos() {
		//apiCall(shibCookie, gateway + "/api/login/", function(response) {
	//	userInfoLabel.text = "Logged as: " + response.cn;
	//	currentUser = response.cn;
		net.setCookie(shibCookie);
		mainSplitWindow.open();
	//}); 
	apiCall(shibCookie, "http://glibrary.ct.infn.it/glibrary_new/indicate/repos.json", function(response) {
		var data = [];
		for (var i=0; i < response.length; i++) {
			var row = Ti.UI.createTableViewRow();
			//row.title = response[i].rep_name;
			row.add(Ti.UI.createLabel({
				text: response[i].rep_name,
				left: 70,
				font: {fontSize: 20, fontWeight: "bold"}
			}));
			row.hasChild = true; 
			row.name = response[i].repository;
			row.add(Ti.UI.createImageView({
				image:response[i].thumb,
				left: 0,
				height: 60,
				width: 60,
				//borderWidth: 1
			}));
			row.height = 70;
			data.push(row);
		}
		repositoryWindow.title = "Repositories"
		repoListTableView.setData(data);
	});
}



if (shibCookie === "")
	loginSplitWindow.open();
else {
	populateRepos();
}

typesWindow = Ti.UI.createWindow({
	backgroundColor: "white"
});

typesTableView = Ti.UI.createTableView();
typesWindow.add(typesTableView);




repoListTableView.addEventListener('click', function(e) {
	currentRepo = e.rowData.name;
	apiCall(shibCookie, gateway + "/glibrary/mountTree/" + currentRepo + "/?node=0", function(response) {
		//Ti.API.info(response);
		var data = [];
		for (var i=0; i < response.length; i++) {
			var type = {};
			type.title = response[i].text;
			type.isLeaf = response[i].leaf;
			type.name = String(response[i].id);
			type.leftImage = "Folder-Add.png";
			type.height = 70;
			if (!type.isLeaf) {
				apiCall(shibCookie, gateway + "/glibrary/mountTree/" + currentRepo + "/?node=" + response[i].id, function(response) {
					//Ti.API.info(response);
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
							row.height = 70;
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
		typesWindow.title = e.row.children[0].text;
		repoNav.open(typesWindow);
	});
});

typesTableView.addEventListener('click', function(e) {
	//Ti.API.info(JSON.stringify(e.rowData));
	Ti.API.info(JSON.stringify(browserNav.window));
	var repoName = e.rowData.path.split("/")[1];
	apiCall(shibCookie, gateway + "/glibrary/glib" + e.rowData.path, function(response) {
		//Ti.API.info(response);
		var data = [];
		//Ti.API.info(response.records);
		for (var i=0; i< response.records.length; i++) {
			//Ti.API.info(response.records[i]);
			var row = Ti.UI.createTableViewRow({height: 100});
			if (repoName === "myTestRepo")
				var title = response.records[i].name
			else
				var title = response.records[i].FileName;
			row.add(Ti.UI.createLabel({
				text: title,
				left: 130,
				font: {fontSize: 20, fontWeight: "bold"}
			}));
			row.hasChild = true;
			row.add(Ti.UI.createImageView({
				left: 5,
				width: 100,
				image: Ti.Utils.base64decode(response.records[i]["/"+ repoName +"/Thumbs:Data"])
			}));
			row.id = response.records[i][e.rowData.path + ":FILE"];
			//Ti.API.info(row.id);
			data.push(row);
		}
		//Ti.API.info(data);
		browserWindow.title = e.row.children[0].text;
		itemBrowserTableView.setData(data);
	});
});

var itemDetail = Ti.UI.createWindow({
	backgroundColor: "white"
});

var mapView = Ti.Map.createView({
			mapType: Titanium.Map.STANDARD_TYPE,
			animate:true,
			regionFit:true,
			userLocation:true,
			region: {
				latitude: 37.675125,
				longitude: 14.051514,
				latitudeDelta: 2,
				longitudeDelta: 2
			}
});
itemDetail.add(mapView);


itemBrowserTableView.addEventListener('click', function(e) {
	apiCall(shibCookie, gateway + "/glibrary/links2/" + currentRepo + "/" + e.rowData.id + "/", function(response) {
		for (var i=0; i< response.length; i++) {
			var ann = Titanium.Map.createAnnotation({
    			latitude:response[i].lat, 
    			longitude:response[i].lng,
    			title: response[i].name,
   				pincolor:Titanium.Map.ANNOTATION_RED,
    			animate:true,
    			leftButton: 'storage.png'
			});
			
			if (response[i].enabled == "1") {
				Ti.API.info(response[i].enabled);
				ann.pincolor = Titanium.Map.ANNOTATION_GREEN;
				ann.rightButton = Titanium.UI.iPhone.SystemButton.DISCLOSURE;
				ann.link = response[i].link;
				mapView.selectAnnotation(ann);
				
			}
			mapView.entryID = e.rowData.id;
			mapView.addAnnotation(ann);
			
		}
		itemDetail.title = e.rowData.title;
		browserNav.open(itemDetail);
	});
	
});

var viewer = Ti.UI.createWindow({backgroundColor:"white"});
var closeViewerBtn = Ti.UI.createButton({
	systemButton: Ti.UI.iPhone.SystemButton.DONE 
});
closeViewerBtn.addEventListener('click', function() {
	viewer.close();
});
viewer.rightNavButton = closeViewerBtn;
var wv2 = Ti.UI.createWebView();
//var iv = Ti.UI.createImageView({top:60});

var actInd = Ti.UI.createActivityIndicator({
  color: 'black',
  font: {fontFamily:'Helvetica Neue', fontSize:2, fontWeight:'bold'},
  message: 'Loading...',
  style:Ti.UI.iPhone.ActivityIndicatorStyle.DARK,
  //top:10,
  //left:10,
  height:'auto',
  width:'auto'
});
wv2.add(actInd);


var pbar=Titanium.UI.createProgressBar({
	width:200,
	height:50,
	min:0,
	max:1,
	value:0,
	style:Titanium.UI.iPhone.ProgressBarStyle.PLAIN,
	top:30,
	message:'Downloading File',
	font:{fontSize:12}
	//color:'#888'
});

mapView.add(pbar);





//reloadBtn.addEventListener('click', function() {
//	wv2.reload();
//});
			
wv2.addEventListener('beforeload', function() {
	Ti.API.info("setting cookie:" + shibCookie);
	wv2.evalJS("document.cookie='" + shibCookie + "';");
	actInd.show();
	Ti.API.info("loading...");
	
});
wv2.addEventListener('load', function(e) {
	wv2.evalJS("document.cookie='" + shibCookie + "';");
	Ti.API.info("caricato");
	Ti.API.info(wv2.evalJS("document.cookie"));
	actInd.hide();
	Ti.API.info(e.url);
	Ti.API.info(Ti.Filesystem.applicationDataDirectory);
	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "prova.pdf");
	//var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,filename);
	Ti.API.info(f);
	//Ti.API.info(JSON.stringify(f));
	Ti.API.info(wv2.html);
	f.write(wv2.html);
	
	
	
	
});

var AnnotationWindow = require('ui/AnnotationWindow');

mapView.addEventListener('click', function(e) {
	if (e.clicksource == 'rightButton') {
		var url = gateway + e.annotation.link.split('"')[1]
		Ti.API.info(url);	
		var fileType = url.substring(url.length-3);
		//if (fileType == "jpg" || fileType == "JPG" || fileType == "pdf" || fileType == "PDF" || fileType == "tif" || fileType == "TIF") {
		if (fileType == "pdf" || fileType == "PDF") { // || fileType == "tif" || fileType == "TIF") {
			Ti.API.info(shibCookie);
			viewer.add(wv2);
			
			
			
			wv2.evalJS("document.cookie='" + shibCookie + "';");
			wv2.url =  url;
			
			viewer.open({modal:true});
		} else  {
			var urlTokens = url.split("/");
			filename = urlTokens[urlTokens.length-1];
			Ti.API.info(filename);
			var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
			if (!f.exists()) {
				download(shibCookie, url, filename, function() {
				
				/*
				viewer.add(iv);
								Ti.API.info(filename);
								var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
								
								Ti.API.info(f);
								iv.image = f.read();
								
								viewer.open();*/
					var annotation = new AnnotationWindow(filename, currentRepo, mapView.entryID, currentUser);
					annotation.open();
				});	
			} else {
				var annotation = new AnnotationWindow(filename, currentRepo, mapView.entryID, currentUser);
				annotation.open();
			}
		}
	}
	
});

function download(cookie, url, filename, _callback) {
	var xhr = Ti.Network.createHTTPClient({timeout: 3000}); //,autoEncodeUrl:0, autoRedirect:false});
	xhr.onload = function() {
		Ti.API.info("caricato");
		Ti.API.info(xhr.location);
		
		var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
		//Ti.API.info(Ti.Filesystem.applicationDataDirectory);
		f.write(this.responseData);
		pbar.hide();
		
	};
	xhr.onerror = function(e) {
		// Ti.API.info(JSON.stringify(e));
		Ti.API.info(e);
		Ti.API.info(xhr.status);
		// Ti.API.info(xhr.getResponseHeader("Location"));
		// Ti.API.info(xhr.allResponseHeaders);
		// Ti.API.info(xhr.autoRedirect);
		// Ti.API.info(xhr.getResponseHeaders());
		// Ti.API.info(xhr.location);
		var redirect = xhr.location.replace(/%25/g, "%");
		Ti.API.info(redirect);
		// Ti.API.info(this.autoEncodeUrl);
		if (xhr.status == 401 && redirect) {
			Ti.API.info("riproviamo");
			var xhr2 = Ti.Network.createHTTPClient({timeout: 30000});
			xhr2.ondatastream = function(e) {
				pbar.value = e.progress;
			};
			xhr2.onerror = function(e) {
				Ti.API.info(JSON.stringify(e));
				Ti.API.info(xhr2.status);
				if (xhr2.status == 404) {
					alert("Replica not found");
					pbar.hide();
					Ti.API.info(xhr2.responseText);
				}
			}
			xhr2.onload = function() {
				Ti.API.info("loaded");
				//mapView.add(Ti.UI.createImageView({
				//	image: xhr2.responseData
				//}));
				var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
				f.write(this.responseData);
				pbar.hide();
				_callback();
			}
			xhr2.open('GET', redirect);
			xhr2.send();
			pbar.show();
		}
	};
	
	// xhr.onreadystatechange = function(e) {
		/*
		if (this.readyState === Ti.Network.HTTPClient.HEADERS_RECEIVED) {
					Ti.API.info("Ho ricevuto gli headers");
				}*/
		
		// Ti.API.info(xhr.getResponseHeaders());
		// Ti.API.info(xhr.getResponseHeader("Location"));
		// Ti.API.info("ReadyState:");
		// Ti.API.info(this.readyState);
		// Ti.API.info(xhr.location);
		// Ti.API.info(this.responseText);
		// Ti.API.info(xhr.status);
		//Ti.API.info(xhr.allResponseHeaders);
		// Ti.API.info(JSON.stringify(e));
	// }
	xhr.open('GET', url);
	Ti.API.info("URL : " + url);
	Ti.API.info("cookie : " + cookie);
	xhr.setRequestHeader("Cookie", cookie);
	xhr.send();
}


function apiCall(cookie, url, _callback) {
	Ti.API.info("apiCall:" + url);
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
		Ti.API.info("error in apiCall");
		alert(e);
	}
	xhr.open('GET', url);
	Ti.API.info("Cookie:'"+ cookie + "'");
	xhr.setRequestHeader("Cookie", cookie);
	xhr.send();
}
