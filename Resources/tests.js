//var url = "https://glibrary.ct.infn.it/secure/view.php?all_variables";


var url = "https://liferay.ct.infn.it/glibrary/time/";

var url2 = "https://liferay.ct.infn.it/glibrary/getTree/deroberto/";
var win = Ti.UI.createWindow({
	backgroundColor : "white",
});




var getRepoButtons = Ti.UI.createButton({
	title : "get DeRoberto tree",
	width : 160,
	height : 70,
	top : 140,
	visible : false
});

getRepoButtons.addEventListener("click", function() {
	apiCall(shibCookie, "https://indicate-gw.consorzio-cometa.it/glibrary/mountTree/deroberto2/?node=1", function(response) {
		alert(response);
	});
});

var getStoragesButton = Ti.UI.createButton({
	title : "get Storages",
	width : 160,
	height : 70,
	top : 240,
	visible : false
})

getStoragesButton.addEventListener("click", function() {
	apiCall(shibCookie, "https://indicate-gw.consorzio-cometa.it/decide/storages/3", function(response) {
		alert(response);
	});
})

var win = Ti.UI.createWindow({
	backgroudColor: "white"
});

win.add(getRepoButtons);
win.add(getStoragesButton);


//win.open();