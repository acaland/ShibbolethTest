function AnnotationWindow(filename, repo, entryID, username) {

	Ti.API.info("filename:" + filename);
	Ti.API.info("repo:" + repo);
	Ti.API.info("entryID:" + entryID);
	Ti.API.info("username:" + username);

	var win = Ti.UI.createWindow({
		backgroundColor : "white"
	});

	var rects = [];

	var closeBtn = Ti.UI.createButton({
		title : "Close",
		style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});

	var addAnnotationsBtn = Ti.UI.createButton({
		title : "Add Annotations",
		style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});

	var loadAnnotationsBtn = Ti.UI.createButton({
		title : "Load Annotations",
		style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});

	var saveAnnotationsBtn = Ti.UI.createButton({
		title : "Save Annotations",
		style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});

	var showAnnotationsBtn = Ti.UI.createButton({
		title : "Show Annotations",
		style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});

	var hideAnnotationsBtn = Ti.UI.createButton({
		title : "Hide Annotations",
		style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});

	var subscribeBtn = Ti.UI.createButton({
		title : "Subscribe",
		style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});

	var flexSpace = Titanium.UI.createButton({
		systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});

	var annotationToolbar = Ti.UI.iOS.createToolbar({
		items : [closeBtn, flexSpace, addAnnotationsBtn, showAnnotationsBtn, loadAnnotationsBtn, flexSpace, subscribeBtn],
		top : 0,
		borderTop : false,
		borderBottom : true
	});

	win.add(annotationToolbar);
	//win.add(iv);

	closeBtn.addEventListener('click', function() {
		win.close();
		//viewer.remove(wv2);
	});

	function RectangleView(coords, popover) {

		coords.w = coords.w || 10;
		coords.h = coords.h || 10;
		var view = Ti.UI.createView({
			backgroundColor : "transparent",
			borderWidth : 5,
			borderRadius : 5,
			borderColor : "red",
			top : coords.y,
			left : coords.x,
			width : coords.w,
			height : coords.h
		});
		view.addEventListener('click', function() {

			popover.show({
				view : view
			});
		});

		popover.rightNavButton.addEventListener('click', function() {

			var comments = JSON.parse(popover.comments);
			Ti.API.info(comments);
			var newComments = [];
			for (var i = 0, j = 0; i < comments.length; i++) {
				if (!comments[i].saved) {
					newComments[j++] = comments[i];
				}
			}
			Ti.API.info('Nuovi commenti:');
			Ti.API.info(JSON.stringify(newComments));
			net.saveComments(repo, view.aID, newComments, username, function(response) {
				if (response.success) {
					for (var i = 0; i < comments.length; i++) {
						comments[i].saved = true;
					}
					popover.comments = JSON.stringify(comments);
					alert('Comments saved');
				}
			});
		});
		//Ti.API.info(JSON.stringify(view));
		return view;
	}

	function CommentsPopover() {

		var popover = Ti.UI.iPad.createPopover({
			width : 250,
			//height : Ti.UI.SIZE,
			height : 80,
			title : "Comments"
		});

		var commentsSaveBtn = Ti.UI.createButton({
			title : "Save"
		});

		popover.rightNavButton = commentsSaveBtn;
		popover.comments = '[]';

		popover.populate = function() {

			var comments = JSON.parse(popover.comments);
			for (var k = 0; k < comments.length; k++) {
				var row = Ti.UI.createTableViewRow();
				var userLbl = Ti.UI.createLabel({
					text : comments[k].author,
					font : {
						fontSize : 16,
						fontWeight : "bold"
					},
					height : 20,
					top : 5,
					left : 5
				});
				var commentLbl = Ti.UI.createLabel({
					text : comments[k].description,
					//borderWidth: 1,
					top : 20,
					left : 5
				});
				row.add(userLbl);
				row.add(commentLbl);
				row.className = "comments";
				annotationsTableView.appendRow(row);
				popover.height = popover.height + 40;
			}
		}
		var annotationsTableView = Ti.UI.createTableView({
			top : 60,
			editable : true
		});

		var annotationTextField = Ti.UI.createTextArea({
			value : "insert comments here",
			top : 0,
			height : 60,
			width : Ti.UI.FILL,
			textAlign : 'left',
			//borderWidth : 1,
			color : "gray",
			font : {
				fontSize : 18
			}
		});
		annotationTextField.addEventListener('focus', function(e) {
			annotationTextField.value = '';
			annotationTextField.color = 'black';
		});
		annotationTextField.addEventListener('return', function(e) {
			var row = Ti.UI.createTableViewRow();
			var userLbl = Ti.UI.createLabel({
				text : username,
				font : {
					fontSize : 16,
					fontWeight : "bold"
				},
				height : 20,
				top : 5,
				left : 5
			});
			var commentLbl = Ti.UI.createLabel({
				text : e.value,
				//borderWidth: 1,
				top : 20,
				left : 5
			});
			row.add(userLbl);
			row.add(commentLbl);
			row.className = "comments";
			var comment = {};
			comment.author = username;
			comment.description = e.value;
			comment.saved = false;

			var arrayComments = JSON.parse(popover.comments);
			arrayComments.push(comment);
			popover.comments = JSON.stringify(arrayComments);

			Ti.API.info(popover.comments);

			annotationsTableView.appendRow(row);
			annotationTextField.value = 'insert comments here';
			annotationTextField.color = 'gray';
			popover.height = popover.height + 40;
		});

		var annotationView = Ti.UI.createView({
			backgroundColor : "white"
		});
		annotationView.add(annotationTextField);
		annotationView.add(annotationsTableView);
		popover.add(annotationView);

		return popover;

	}

	var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, filename);

	var iv = Ti.UI.createImageView({
		borderWidth : 1,
		url : f.nativePath,
		//image : "http://glibrary.ct.infn.it/t/indicate/spasimo_022.jpg",
		//image : "http://www.direttanews.it/wp-content/uploads/laetitia-casta.jpg",
		//image: "http://www.babywallpapers.info/wallpapers/image/Kid-Baby-Wallpaper.jpg",
		width : "auto",
		height : "auto"
	});

	iv.addEventListener('load', function() {
		Ti.API.info(iv.size.width + "x" + iv.size.height);
		Ti.API.info(iv.width + "x" + iv.height);

	});
	//var wv = Ti.UI.createWebView({
	//	borderWidth : 1,
	//	url : "http://www.direttanews.it/wp-content/uploads/laetitia-casta.jpg"
	//});

	//wv.addEventListener('load', function() {
	//	Ti.API.info(wv.children);
	//});

	var sv = Ti.UI.createScrollView({
		top : 40,
		contentWidth : 'auto',
		contentHeight : 'auto',
		showVerticalScrollIndicator : true,
		showHorizontalScrollIndicator : true,
		//borderWidth: 2,
		//borderColor: "green",
		//bottom : 100,
		scrollable : true,

		maxZoomScale : 2,
		minZoomScale : 0.1
	});

	//win.add(iv);
	sv.add(iv);

	//win.add(circle);
	//win.add(image);
	//win.add(wv);
	win.add(sv);

	var touchMoveBase = {
		set : function(point) {
			this.x = point.x;
			this.y = point.y;
		}
	}
	/*
	 image.addEventListener('click', function(e) {
	 Ti.API.info("click detected");
	 });

	 image.addEventListener('singletap', function(e) {
	 Ti.API.info("tap detected");
	 }); */

	function touchStartControl(e) {
		Ti.API.info("touch start: " + e.x + ", " + e.y);
		Ti.API.info(JSON.stringify(e));
		touchMoveBase.x = e.x;
		touchMoveBase.y = e.y;
		var r = new RectangleView({
			x : e.x,
			y : e.y
		}, new CommentsPopover());
		touchMoveBase.rect = r;
		sv.add(r);
		Ti.API.info(JSON.stringify(r));
		rects.push(r);

	}

	function touchMoveControl(e) {
		//Ti.API.info("touch move" + e.x + ", " + e.y);
		//Ti.API.info("width: " + String(e.x - touchMoveBase.x));
		//Ti.API.info("height: " + String(e.y - touchMoveBase.y));

		touchMoveBase.rect.width = Math.abs(e.x - touchMoveBase.x + 5);
		touchMoveBase.rect.height = Math.abs(e.y - touchMoveBase.y + 5);

		/*touchMoveBase.rect.animate({
		 width: touchMoveBase.rect.width,
		 height: touchMoveBase.rect.height,
		 duration: 1
		 }); */

	}

	function touchEndControl(e) {
		Ti.API.info("touchend" + e.x + ", " + e.y);
		Ti.API.info(touchMoveBase.rect.width);
		Ti.API.info(touchMoveBase.rect.height);
	}

	//wv.addEventListener('touchend', function(e) {
	//	Ti.API.info("touchend" + e.x + ", " + e.y);
	//});
	//win.add(circle);
	/*
	 // object to store last event position

	 // circle position before it has been animated
	 var circlePosition = { top: circle.top, left: circle.left };

	 circle.addEventListener('touchstart', function(e) {
	 Titanium.API.info('Touch start: ' + JSON.stringify(e));
	 // get absolute position at start
	 touchMoveBase.set(e.globalPoint);
	 });

	 circle.addEventListener('touchmove', function(e) {
	 Titanium.API.info('Moving: ' + JSON.stringify(e));
	 // update the co-ordinates based on movement since last movement or touch start
	 circlePosition.top += e.globalPoint.y - touchMoveBase.y;
	 circlePosition.left += e.globalPoint.x - touchMoveBase.x;
	 circle.animate({
	 top: circlePosition.top,
	 left: circlePosition.left,
	 duration: 1
	 });
	 // reset absolute position to current position so next event will be relative to current position
	 touchMoveBase.set(e.globalPoint);
	 });

	 circle.addEventListener('touchend', function(e) {
	 Titanium.API.info('Stop drag: ' + JSON.stringify(e));
	 }); */

	var enableAnnotations = Ti.UI.createButton({
		title : "Make Annotations",
		left : 10,
		width : 140,
		height : 50,
		bottom : 30
	});

	var disableAnnotations = Ti.UI.createButton({
		title : "Disable Annotations",
		left : 10,
		height : 50,
		bottom : 30,
		width : 100,
		visible : false
	});

	var annotationView = Ti.UI.createView({
		backgroundColor : "transparent",
		width : sv.width,
		height : sv.height,
		borderColor : "yellow",
		borderWidth : 4,
		visible : false
	});
	//win.add(annotationView);

	addAnnotationsBtn.addEventListener('click', function() {
		Ti.API.info("annotation abilitate");
		sv.setScrollable(false);
		for (var i = 0; i < rects.length; i++) {
			sv.remove(rects[i]);
			rects[i] = null;
		}
		rects = [];
		Ti.API.info(rects.length);
		//sv.contentHeight = iv.size.height;
		//sv.height = sv.contentHeight;
		//sv.contentWidth = iv.size.width;
		//annotationView.show();
		//sv.width = sv.contentWidth;
		// Ti.API.info(sv.contentHeight);
		// Ti.API.info(sv.contentWidth);
		// Ti.API.info(iv.size.width);
		// Ti.API.info(iv.size.height);
		// Ti.API.info(JSON.stringify(sv.size));
		//Ti.API.info(JSON.stringify(sv.contentOffset));

		iv.addEventListener('touchstart', touchStartControl);
		iv.addEventListener('touchmove', touchMoveControl);
		iv.addEventListener('touchend', touchEndControl);
		//sv.canCancelEvents = false;
		//sv.disableBounce = true;
		//sv.touchEnabled = false;
		//addAnnotations.hide();
		annotationToolbar.items = [closeBtn, flexSpace, saveAnnotationsBtn, showAnnotationsBtn, loadAnnotationsBtn, flexSpace, subscribeBtn];
		//annotationToolbar.items[2] = saveAnnotationBtn;
		//disableAnnotations.show();
	});

	var net = require('services/net');
	saveAnnotationsBtn.addEventListener('click', function() {
		sv.setScrollable(true);
		iv.removeEventListener('touchstart', touchStartControl);
		iv.removeEventListener('touchmove', touchMoveControl);
		iv.removeEventListener('touchend', touchEndControl);

		var annotations = [];
		for (var i = 0; i < rects.length; i++) {
			annotations[i] = {
				left : Math.round(rects[i].left),
				top : Math.round(rects[i].top),
				width : Math.round(rects[i].width),
				height : Math.round(rects[i].height)
			};
		}
		net.addAnnotations(repo, entryID, username, annotations, function(response) {
			if (response.success) {
				Ti.API.info("annotations salvate");
				//Ti.API.info(response.savedAnnotations);
				//Ti.API.info(rects.length);
				//Ti.API.info(JSON.stringify(iv.children));
				for (var i = 0; i < rects.length; i++) {
					//Ti.API.info(rects[i]);
					sv.remove(rects[i]);
					rects[i] = null;
				}
				rects = [];
				annotationToolbar.items = [closeBtn, flexSpace, addAnnotationsBtn, showAnnotationsBtn, loadAnnotationsBtn, flexSpace, subscribeBtn];
			}
		});

	});

	loadAnnotationsBtn.addEventListener('click', function() {
		var annotations = [];
		Ti.API.info("rects:" + JSON.stringify(rects));
		if (rects.length == 0) {
			net.loadAnnotations(repo, entryID, function(annotations) {

				for (var i = 0; i < annotations.length; i++) {
					//Ti.API.info(annotations[i]);
					var coords = {
						x : annotations[i].left,
						y : annotations[i].top,
						w : annotations[i].width,
						h : annotations[i].height
					}
					Ti.API.info("annotation caricate");
					var popover = new CommentsPopover();
					rects[i] = new RectangleView(coords, popover);
					rects[i]['creator'] = annotations[i]['creator'];
					rects[i]['creationTime'] = annotations[i]['creationTime'];
					rects[i]['aID'] = annotations[i]['FILE'];
					Ti.API.info("annotationID:");
					Ti.API.info(rects[i]['aID']);
					net.loadComments(repo, rects[i]['aID'], function(comments) {
						if (comments.length > 0) {
							for (var i = 0; i < comments.lenght; i++) {
								comments.saved = true;
							}
							popover.comments = JSON.stringify(comments);
							popover.populate();
						}
					});

					Ti.API.info(JSON.stringify(rects[i]));
					sv.add(rects[i]);
				}
			});
			annotationToolbar.items = [closeBtn, flexSpace, addAnnotationsBtn, hideAnnotationsBtn, loadAnnotationsBtn, flexSpace, subscribeBtn];
		}
	});

	hideAnnotationsBtn.addEventListener('click', function() {
		for (var i = 0; i < rects.length; i++) {
			//Ti.API.info(rects[i]);
			rects[i].hide();
		}
		annotationToolbar.items = [closeBtn, flexSpace, addAnnotationsBtn, showAnnotationsBtn, loadAnnotationsBtn, flexSpace, subscribeBtn];
	});

	showAnnotationsBtn.addEventListener('click', function() {
		if (rects.length > 0) {
			for (var i = 0; i < rects.length; i++) {
				//Ti.API.info(rects[i]);
				rects[i].show();
			}
			annotationToolbar.items = [closeBtn, flexSpace, addAnnotationsBtn, hideAnnotationsBtn, loadAnnotationsBtn, flexSpace, subscribeBtn];
		}
	});

	/*

	loadBtn.addEventListener('click', function() {
	annotations = Ti.App.Properties.getList("annotations", []);
	Ti.API.info(JSON.stringify(annotations));
	for (var i = 0; i < annotations.length; i++) {
	Ti.API.info(annotations[i]);
	rects[i] = new RectangleView(annotations[i]);
	Ti.API.info(JSON.stringify(rects[i]));
	iv.add(rects[i]);
	}
	});

	deleteBtn.addEventListener('click', function() {
	for (var i = 0; i < rects.length; i++) {
	iv.remove(rects[i]);
	rects[i] = null;
	}
	rects = [];
	Ti.App.Properties.setList("annotations", rects);
	});
	*/

	//win.add(enableAnnotations);
	//win.add(disableAnnotations);

	//win.add(saveBtn);
	//win.add(loadBtn);
	//win.add(deleteBtn);

	return win;
}

module.exports = AnnotationWindow;

