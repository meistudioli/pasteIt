//pasteIt
(function() {
	var dataURItoBlob, ddBeacon, ddAct, isEventSupported, createCSSClass, attachedCallback, evtHandler, standard, negative, vessel, mark;

	if (typeof FileReader == 'undefined' || typeof MutationObserver == 'undefined') return;

	//method
	dataURItoBlob = function(dataURI) {
	    // convert base64 to raw binary data held in a string
		// http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
		// https://github.com/blueimp/JavaScript-Canvas-to-Blob/blob/master/canvas-to-blob.js
	    var byteString = (dataURI.split(',')[0].indexOf('base64') != -1) ? atob(dataURI.split(',')[1]) : decodeURIComponent(dataURI.split(',')[1]),
			mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0],
			ab = new ArrayBuffer(byteString.length),
			ia = new Uint8Array(ab),
			bb;
		for (var i=-1,l=byteString.length;++i<l;) ia[i] = byteString.charCodeAt(i);
		if (window.Blob) bb = new Blob([ia], {type: mimeString});
		else {
			bb = new (window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder);
			bb.append(ab);
			bb = bb.getBlob(mimeString);
		}//end if
		return bb;
	};

	ddBeacon = function(action) {
		[].slice.call(document.querySelectorAll('[data-paste-it]')).forEach(
			function(target) {
				target.executeCallBack(action);
			}
		);
	};

	ddAct = function(e) {
		var target, action, imageData, files, amt, html;

		e.preventDefault();
		target = e.target;
		action = e.type.toLowerCase();

		switch(action) {
			case 'drop':
				ddBeacon(action);
				if (typeof e.dataTransfer == 'undefined' || typeof target.tagName == 'undefined' || !/textarea/i.test(target.tagName) || !target.pasteIt) return;

				try {
					html = e.dataTransfer.getData('text/html');
				} catch(err) {}

				if (html) {
					//html
					vessel.innerHTML = html;
					
					files = [];
					[].slice.call(vessel.querySelectorAll('img')).forEach(
						function(img) {
							if (img.src) files.push(img.src);
						}
					);
					while(vessel.childNodes.length) vessel.removeChild(vessel.firstChild);
					if (!files.length) return;

					target.executeCallBack('prepare');
					amt = files.length;
					imageData = [];
					files.forEach(
						function(img) {
							var image;
							image = new Image();
							image.crossOrigin = 'anonymous';
							image.onload = image.onerror = function(evt) {
								var canvas, ctx, dataURL;
								if (evt.type == 'error') amt--;
								else {
									canvas = document.createElement('canvas');
									canvas.width = this.width;
									canvas.height = this.height;

									ctx = canvas.getContext('2d');
									ctx.drawImage(this, 0, 0);

									try {
										dataURL = canvas.toDataURL('image/png');
										imageData.push({dataURL:dataURL, blob:dataURItoBlob(dataURL)});
									} catch(err) { amt--; }
								}//end if
								if (imageData.length == amt) target.executeCallBack('drop', imageData);
							};
							image.src = img;
						}
					);
				} else if (typeof e.dataTransfer.files != 'undefined' && e.dataTransfer.files.length) {
					//files
					files = [].slice.call(e.dataTransfer.files).filter(
						function(file) {
							return /image/.test(file.type) || (!file.type &&/\.png/i.test(file.name));
						}
					);
					if (!files.length) return;

					target.executeCallBack('prepare');
					amt = files.length;
					imageData = [];
					files.forEach(
						function(file) {
							var reader;
							reader = new FileReader();
							reader.file = file;
							reader.onload = reader.onerror = function(evt) {
								(evt.type == 'error') ? amt-- : imageData.push({dataURL:evt.target.result, blob:this.file});
								if (imageData.length == amt) {
									imageData.sort(
										function(a, b) {
											var nA, nB;
											nA = a.blob.name.toUpperCase();
											nB = b.blob.name.toUpperCase();
											return (nA < nB) ? -1 : ((nA > nB) ? 1 : 0);
										}
									);
									target.executeCallBack('drop', imageData);
								}//end if
							};
							reader.readAsDataURL(file);
						}
					);
				}//end if
				break;
			default:
				ddBeacon(action);
		}//end switch
	};

	isEventSupported = function(eventName, element) {
		var e, en = 'on' + eventName, isSupported;
		e = document.createElement('div');
		if (element) e = (element.tagName) ? element.cloneNode(true) : element;
		isSupported = (en in e);
		if (!isSupported && e.setAttribute) {
			e.setAttribute(en, '');
			isSupported = typeof e[en] == 'function';
			if (typeof e[en] != 'undefined') e[en] = null;
			e.removeAttribute(en);
		}//end if
		e = null;
		return isSupported;
	};

	createCSSClass = function(selector, style, brandNew) {
		if (!document.styleSheets || document.getElementsByTagName('head').length == 0) return;
	    var styleSheet, mediaType, getSheet = false;
		if (typeof brandNew != 'undefined' && brandNew) {
			if (typeof brandNew.sheet != 'undefined') {
				styleSheet = brandNew.sheet;
				mediaType = typeof styleSheet.media;
				getSheet = true;
			} else {
				var s = document.createElement('style');
				s.type = 'text/css';
				document.getElementsByTagName('head')[0].appendChild(s);
				s.usable = true;
				navigator.ssHost = document.styleSheets[document.styleSheets.length-1];
			}//end if
		}//end if
		if (!getSheet) {
			if (navigator.ssHost) {
				styleSheet = navigator.ssHost;
				mediaType = typeof styleSheet.media;
			} else {
				for (var i=-1,l=document.styleSheets.length;++i<l;) {
					var ss = document.styleSheets[i], media, isCrossDomain, mediaText;
					if (ss.disabled || (typeof ss.usable != 'undefined' && !ss.usable)) continue;
					media = ss.media;
					mediaType = typeof media;
					if (typeof ss.usable == 'undefined') ss.usable = false;
					if (mediaType == 'string') {
						try {
							isCrossDomain = (ss.rules == null) ? true : false;
						} catch(e) { isCrossDomain = true; }
						if ((media == '' || media.indexOf('screen') != -1) && !isCrossDomain) { styleSheet = ss; ss.usable = true; }
					} else if (mediaType == 'object') {
						try {
							isCrossDomain = (ss.cssRules == null) ? true : false;
							mediaText = media.mediaText;
						} catch(e) {isCrossDomain = true;}
						if (!isCrossDomain && (typeof mediaText != 'undefined' && (mediaText == '' || mediaText.indexOf('screen') != -1))) { styleSheet = ss; ss.usable = true; }
					}//end if
					if (typeof styleSheet != 'undefined') break;
				}//end for
				if (typeof styleSheet == 'undefined') {
					var s = document.createElement('style');
					s.type = 'text/css';
					document.getElementsByTagName('head')[0].appendChild(s);
					for (var i=-1,l=document.styleSheets.length;++i<l;) {
						var ss = document.styleSheets[i];
						if (ss.disabled || typeof ss.usable != 'undefined' && !ss.usable) continue;
						ss.usable = true;
						styleSheet = ss;
					}//end for
					mediaType = typeof styleSheet.media;
				}//end if
				navigator.ssHost = styleSheet;
			}//end if
		}//end if

	    if (mediaType == 'string') {
			for (var i=-1,l=styleSheet.rules.length;++i<l;) if (styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) { styleSheet.rules[i].style.cssText = style; return; }
			styleSheet.addRule(selector, style);
	    } else if (mediaType == 'object') {
	        var isClear;
	        try {
	            isClear = (styleSheet.cssRules == null) ? false : true;
	        } catch(err) { isClear = true; }
	        if (isClear) {
	            for (var i=-1,l=styleSheet.cssRules.length;++i<l;) if (styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) { styleSheet.cssRules[i].style.cssText = style; return; }
	            styleSheet.insertRule(selector + '{' + style + '}', 0);
	        } else {
	            styleSheet.insertRule(selector + '{' + style + '}', 0);
	        }//end if
	    }//end if
	};

	evtHandler = function(e) {
		var items, callBacks, kc, target;

		switch (e.type.toLowerCase()) {
			case 'paste':
				if (!e.clipboardData) return;
				items = e.clipboardData.items;
				if (items) {
					var executeCallBack;

					target = this;
					executeCallBack = this.executeCallBack;
					items = [].slice.call(items).filter(
						function(item) {
							return /image/.test(item.type);
						}
					);
					if (!items.length) return;

					e.preventDefault();
					target.executeCallBack('prepare');
					items.forEach(
						function(item) {
							var blob, URLObj, reader;
							blob = item.getAsFile();
							// URLObj = window.URL || window.webkitURL;
							// target.executeCallBack('paste', {dataURL:URLObj.createObjectURL(blob), blob:blob});
							reader = new FileReader();
							reader.onload = reader.onerror = function(evt) {
								if (evt.type != 'error') target.executeCallBack('paste', {dataURL:evt.target.result, blob:blob});
							};
							reader.readAsDataURL(blob);							
						}
					);
				}//end if
				break;
			default:
				kc = e.keyCode;
				if (kc == 86 && (e.metaKey || e.ctrlKey)) {
					//ctrl + v
					mark.target = this;
					mark.start = this.selectionStart;
					mark.end = this.selectionEnd;
					negative.focus();
				}//end if
		}//end switch
	};

	attachedCallback = function(node) {
		var pasteItValue;
		if (typeof node.tagName == 'undefined' || !/textarea/i.test(node.tagName) || typeof node.pasteIt != 'undefined') return;

		pasteItValue = false;
		Object.defineProperties(node, {
			callBacks: {
				enumerable: false,
				configurable: false,
				value: []
			},
			executeCallBack: {
				enumerable: false,
				configurable: false,
				value: function(action, dataURLs) {
					var target, args;
					if (!this.callBacks.length) return;
					target = this;
					args = [target, action];
					if (dataURLs) {
						if (!Array.isArray(dataURLs)) dataURLs = [dataURLs];
						if (dataURLs.length) args.push(dataURLs);
					}//end if
					this.callBacks.forEach(
						function(fn) {
							fn.apply(null, args);
						}
					);
				}
			},
			pasteIt: {
				enumerable: true,
				configurable: false,
				get: function() {
					return pasteItValue;
				},
				set: function(flag) {
					var action;
					if (typeof flag != 'boolean') return;
					
					pasteItValue = flag;
					action = standard ? 'paste' : 'keydown';

					if (pasteItValue) {
						if (!this.hasAttribute('data-paste-it')) this.setAttribute('data-paste-it', 'on');
						this.addEventListener(action, evtHandler, false);
					} else {
						if (this.hasAttribute('data-paste-it')) this.removeAttribute('data-paste-it', 'on');
						this.removeEventListener(action, evtHandler, false);
					}//end if
				},
			},
			addCallback: {
				configurable: false,
				value: function(fn) {
					if (typeof fn != 'function' || this.callBacks.indexOf(fn) != -1) return;
					this.callBacks.push(fn);
				}
			},
			removeCallback: {
				configurable: false,
				value: function(fn) {
					if (typeof fn != 'function' || this.callBacks.indexOf(fn) == -1) return;
					this.callBacks.splice(this.callBacks.indexOf(fn), 1);
				}
			}
		});

		//attrChange
		new MutationObserver(
			function(mutations) {
				mutations.forEach(function(mutation) {
					var target, flag;
					if (mutation.type != 'attributes') return;

					target = mutation.target;
					flag = target.hasAttribute('data-paste-it');
					if (flag) {
						if (!target.pasteIt) target.pasteIt = true;
					} else {
						if (target.pasteIt) target.pasteIt = false;
					}//end if
				});
			}
		).observe(node, {attributes:true});

		node.pasteIt = node.hasAttribute('data-paste-it');
	};

	//standard
	if (typeof ClipboardEvent != 'undefined') {
		standard = true;
		try {
			standard = new ClipboardEvent('paste');
			if (!standard.clipboardData.items) standard = false;
		} catch(err) {}
	} else standard = false;

	//childList
	new MutationObserver(
		function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.type != 'childList') return;
				[].slice.call(mutation.addedNodes).forEach(
					function(node) {
						// attachedCallback(node);
						if (node.childNodes.length) {
							[].slice.call(node.querySelectorAll('textarea')).forEach(
								function(target) {
									attachedCallback(target);
								}
							);
						} else {
							attachedCallback(node);
						}//end if
					}
				);
			});
		}
	).observe(document.body, {childList:true, subtree:true});

	//dd
	if (isEventSupported('drop')) {
		createCSSClass('body #pasteItVessel', 'position:relative;width:0;height:0;overflow:hidden;display:none;');
		vessel = document.createElement('div');
		vessel.id = 'pasteItVessel';
		document.body.appendChild(vessel);

		['dragenter', 'dragover', 'dragleave', 'drop'].forEach(
			function(evt) {
				document.body.addEventListener(evt, ddAct, false);
			}
		);
	}//end if

	//negative
	if (!standard) {
		[].slice.call(document.querySelectorAll('#pasteItNegative')).forEach(
			function(node) {
				node.remove();
			}
		);
		
		mark = {
			target: '',
			start: 0,
			end: 0
		};
		//selectionEnd
		createCSSClass('body #pasteItNegative', 'position:fixed;left:0;top:0;width:5px;height:0;overflow:hidden;opacity:0;margin-left:-5px;');
		negative = document.createElement('div');
		negative.id = 'pasteItNegative';
		negative.setAttribute('contenteditable', true);
		document.body.appendChild(negative);

		new MutationObserver(
			function(mutations) {
				mutations.forEach(function(mutation) {
					var node, target, text, image;
					if (mutation.type != 'childList' || !mutation.addedNodes.length) return;

					target = mark.target;
					node = mutation.addedNodes[0];

					if (node.nodeType == 3) {
						//textNode
						try {
							//MSIE might have error when copy website's img tag
							text = node.parentNode.innerHTML;
						    target.value = target.value.substring(0, mark.start) + text + target.value.substring(mark.end, target.value.length);

						    //recover cursor
							target.focus();
							target.selectionStart = target.selectionEnd = mark.start + text.length;
						} catch(err) {}
					} else if (node.nodeType == 1 && node.src) {
						target.executeCallBack('prepare');
						image = new Image();
						image.crossOrigin = 'anonymous';
						image.onload = function() {
							var canvas, ctx, dataURL;
							canvas = document.createElement('canvas');
							canvas.width = this.width;
							canvas.height = this.height;

							ctx = canvas.getContext('2d');
							ctx.drawImage(this, 0, 0);

							try {
								dataURL = canvas.toDataURL('image/png');
								target.executeCallBack('paste', {dataURL:dataURL, blob:dataURItoBlob(dataURL)});
							} catch(err) {}

							//recover cursor
							target.focus();
							target.selectionStart = mark.start;
							target.selectionEnd = mark.end;
						};
						image.src = node.src;
					}//end if

					//clear
					node = node.parentNode;
					if (node) while(node.childNodes.length) node.removeChild(node.firstChild);
				});
			}
		).observe(negative, {childList:true, characterData:true});
	}//end if

	//attach
	[].slice.call(document.querySelectorAll('textarea')).forEach(
		function(node) {
			attachedCallback(node);
		}
	);
})();
/*programed by mei(李維翰), http://www.facebook.com/mei.studio.li*/