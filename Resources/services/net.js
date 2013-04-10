var cookie = "";

exports.setCookie = function(shibbolethCookie) {
	cookie = shibbolethCookie;
};

exports.retrieveIdpList = function(entityId, _callback) {

	//entityID example "https://indicate-gw.consorzio-cometa.it/shibboleth"
	// old WAYF endpoint = gridp.ct.infn.it
	var dsEndPoint = "https://gridp.garr.it/ds/WAYF?entityID="+ entityId +"&json=true";
	// var dsEndPoint = "http://glibrary.ct.infn.it/t/idps.json";
	var xhr = Ti.Network.createHTTPClient();
	Ti.API.info(dsEndPoint);

	xhr.onload = function() {
		//Ti.API.info(this.responseText);
		try {
			var response = JSON.parse(this.responseText);	
		} catch (err) {
			Ti.API.info(err);
		} 
		
		//Ti.API.info(response);
		//Ti.API.info(response.federations);
		_callback(response.federations);
	}
	xhr.onerror = function() {
		Ti.API.debug(e.error);
		alert(e.error);
	}

	xhr.open("GET", dsEndPoint);
	xhr.send();

};

exports.apiCall = function(url, _callback) {
	Ti.API.info(url);
	var xhr = Ti.Network.createHTTPClient();
	xhr.onload = function() {
		//Ti.API.info(this.responseText);
		if (this.responseText.indexOf("<title>Access System Failure</title>") != -1) {
			//mainSplitWindow.close();
			//loginSplitWindow.open();
			_callback("session expired");
		} else {
			var response = JSON.parse(this.responseText);
			//Ti.API.info(response);
			_callback(response);
		}
	};
	xhr.onerror = function(e) {
		Ti.API.info(xhr.status);
		alert(e);
		
	}
	xhr.open('GET', url);
	Ti.API.info("Cookie:'" + cookie + "'");
	xhr.setRequestHeader("Cookie", cookie);
	xhr.send();
};

exports.addAnnotations = function(repo, entryID, creator, annotations, _callback) {
	var url = 'https://indicate-gw.consorzio-cometa.it/glibrary/addAnnotations/' + repo + '/' + entryID + '/';
	Ti.API.info(url);
	var xhr = Ti.Network.createHTTPClient();
	xhr.onload = function() {
		Ti.API.info(this.responseText);
		var response = JSON.parse(this.responseText);
		Ti.API.info(response);
		_callback(response);

	};
	xhr.onerror = function(e) {
		Ti.API.info(xhr.status);
		Ti.API.info(xhr.responseText);
		alert(e);
	}
	xhr.open('POST', url);
	Ti.API.info("Cookie:'" + cookie + "'");
	xhr.setRequestHeader("Cookie", cookie);
	xhr.send({creator: creator, annotations: JSON.stringify(annotations)});
	//xhr.send();
};


exports.loadAnnotations = function(repo, entryID, _callback) {
	var url = 'https://indicate-gw.consorzio-cometa.it/glibrary/loadAnnotations/' + repo + '/' + entryID + '/';
	Ti.API.info(url);
	var xhr = Ti.Network.createHTTPClient();
	xhr.onload = function() {
		//Ti.API.info(this.responseText);
		var response = JSON.parse(this.responseText);
		//Ti.API.info(response);
		_callback(response);

	};
	xhr.onerror = function(e) {
		Ti.API.info(xhr.status);
		Ti.API.info(xhr.responseText);
		alert(e);
	}
	xhr.open('GET', url);
	Ti.API.info("Cookie:'" + cookie + "'");
	xhr.setRequestHeader("Cookie", cookie);
	xhr.send();
}; 

exports.saveComments = function(repo, annotationID, comments, author, _callback) {
	var url = 'https://indicate-gw.consorzio-cometa.it/glibrary/saveComments/' + repo + '/' + annotationID + '/';
	Ti.API.info(url);
	var xhr = Ti.Network.createHTTPClient();
	xhr.onload = function() {
		Ti.API.info(this.responseText);
		var response = JSON.parse(this.responseText);
		Ti.API.info(response);
		_callback(response);

	};
	xhr.onerror = function(e) {
		Ti.API.info(xhr.status);
		Ti.API.info(xhr.responseText);
		alert(e);
	}
	xhr.open('POST', url);
	Ti.API.info("Cookie:'" + cookie + "'");
	xhr.setRequestHeader("Cookie", cookie);
	xhr.send({author: author, comments: JSON.stringify(comments)});
};

exports.loadComments = function(repo, annotationID, _callback) {
	var url = 'https://indicate-gw.consorzio-cometa.it/glibrary/loadComments/' + repo + '/' + annotationID + '/';
	Ti.API.info(url);
	var xhr = Ti.Network.createHTTPClient();
	xhr.onload = function() {
		//Ti.API.info(this.responseText);
		var response = JSON.parse(this.responseText);
		Ti.API.info(response);
		_callback(response);
	};
	xhr.onerror = function(e) {
		Ti.API.info(xhr.status);
		Ti.API.info(xhr.responseText);
		alert(e);
	}
	xhr.open('GET', url);
	Ti.API.info("Cookie:'" + cookie + "'");
	xhr.setRequestHeader("Cookie", cookie);
	xhr.send();	
};

