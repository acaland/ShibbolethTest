
exports.retrieveIdpList = function (entityId, _callback) {
	
	// entityID example "https://indicate-gw.consorzio-cometa.it/shibboleth"

	//var dsEndPoint = "https://gridp.ct.infn.it/ds/WAYF?entityID="+ entityId +"&json=true";
	var dsEndPoint = "http://glibrary.ct.infn.it/t/idps.json";
	var xhr = Ti.Network.createHTTPClient();
	
	xhr.onload = function() {
		
		var response = JSON.parse(this.responseText);
		//Ti.API.info(response.federations);
		_callback(response.federations);
	}
	xhr.onerror = function() {
		Ti.API.debug(e.error);
		alert(e.error);
	}
	
	xhr.open("GET", dsEndPoint);
	xhr.send();
	
}
