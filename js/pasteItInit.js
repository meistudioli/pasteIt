var init, tRy;

tRy = {
	stopEvents: function(e, mode) {
		//mode:0/1/2 -> stopPropagation/preventDefault/both
		if (typeof(mode) == 'undefined' || [0,1].indexOf(mode) == -1) mode = 2;
		switch (mode) {
			case 0:
				(e.stopPropagation) ? e.stopPropagation() : window.event.cancelBubble = true;
				break;
			case 1:
				(e.preventDefault) ? e.preventDefault() : window.event.returnValue = false;
				break;
			default:
				if (e.stopPropagation) {
					e.stopPropagation();
					e.preventDefault();
				} else {
					window.event.cancelBubble = true;
					window.event.returnValue = false;
				}//end if
		}//end if
		try {philosophor.reset();} catch(e) {};
	},
	eTrack: function() {
		//arguments: [elment, request, type]
		var t = arguments[0], r = arguments[1], type = arguments[2] || 't', ft = '', p;
		if (type == 't') {
			r = r.toLowerCase();
			while(t != null) {
				if (t.tagName && (t.tagName.toLowerCase() == 'body' || t.tagName.toLowerCase() == r)) break;
				t = t.parentNode;
			}//end if
			if (t && t.tagName.toLowerCase() != 'body' && r != 'body') ft = t;
		} else {
			p = new RegExp("(^|\\s)" + r + "(\\s|$)");
			while(t != null) {
				if (typeof t.className != 'undefined' && (t.className == r || p.test(t.className))) break;
				t = t.parentNode;
			}//end if
			if (t != null && typeof t.className != 'undefined' && (t.className == r || p.test(t.className))) ft = t;
		}//end if
		return ft;
	},
	tNa: function(e) {
		var obj = {};//t:target, a:action
		e = e._event || e;
		if (window.event && window.event.srcElement) { obj.a = window.event.type.toLowerCase(); obj.t = window.event.srcElement; }
		else if (e && e.target) { obj.a = e.type.toLowerCase(); obj.t = e.target; }
		if (obj.t && arguments[1]) obj.t = this.eTrack(obj.t,arguments[1],arguments[2]);
		return obj;
	},
	getPageSize: function() {
		var xScroll, yScroll;
		
		if (window.innerHeight && window.scrollMaxY)  {xScroll = document.body.scrollWidth; yScroll = window.innerHeight + window.scrollMaxY; }
		else if (document.body.scrollHeight > document.body.offsetHeight){ xScroll = document.body.scrollWidth; yScroll = document.body.scrollHeight; }
		else { xScroll = document.body.offsetWidth; yScroll = document.body.offsetHeight; }
		
		var windowWidth, windowHeight, pageWidth, pageHeight;
		if (self.innerHeight) {	windowWidth = self.innerWidth; windowHeight = self.innerHeight; }
		else if (document.documentElement && document.documentElement.clientHeight) { windowWidth = document.documentElement.clientWidth; windowHeight = document.documentElement.clientHeight; }
		else if (document.body) { windowWidth = document.body.clientWidth; windowHeight = document.body.clientHeight; }	
		
		pageHeight = (yScroll < windowHeight) ? windowHeight : yScroll;
		pageWidth = (xScroll < windowWidth) ? windowWidth : xScroll;
		return [pageWidth,pageHeight,windowWidth,windowHeight];
	},
	createCSSClass: function(selector, style, brandNew) {
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
	},
	fcamelCase: function(all, letter) {
		return letter.toUpperCase();
	},
	camelCase: function(str) {
		return str.replace(/-([a-z])/ig, this.fcamelCase);
	},
	capitalize: function(str){
	    return str.replace(/^[a-z]{1}/,function($1){return $1.toLocaleUpperCase()});
	},
	mk: function(c, Data) {
		if (!arguments.length) return document.createDocumentFragment();
		var getTag = (Data && Data.tag) ? Data.tag : 'div', e = document.createElement(getTag);
		if (c) e.className = c;
		if (Data) {
			for (i in Data.s) e.style[i] = Data.s[i];//style
			for (i in Data.att) e[i] = Data.att[i];//attribute
		}//end if
		return e;
	},
	isCSSSupport: function(css, element) {
		var e = this.mk(''), css, isSupported;
		css = (/^-ms/.test(css)) ? ('ms' + this.camelCase(css.replace(/-ms/,''))) : this.camelCase(css);
		if (element && element.tagName) e = element.cloneNode(true);
		isSupported = (css in e.style);
		e = null;
		return isSupported;
	},
	isAniSupport: function() {
		var b = ['webkit', '', 'moz', 'o', 'ms'], anis;
		for (var i=-1,l=b.length;++i<l;) {
			var prefix = (b[i]) ? '-' : '', t, t2, k, a, p, af;
			t = prefix + b[i] + prefix + 'transform';
			t2 = prefix + b[i] + prefix + 'transition';
			k = prefix + b[i] + prefix + 'keyframes';
			a = prefix + b[i] + prefix + 'animation';
			p = prefix + b[i] + prefix + 'perspective';
			af = prefix + b[i] + prefix + 'animate-timing-function';
			o = prefix + b[i] + prefix + 'transform-origin';
			s = prefix + b[i] + prefix + 'transform-style';
			d = prefix + b[i] + prefix + 'transition-delay';
			du = prefix + b[i] + prefix + 'transition-duration';
			if (this.isCSSSupport(t) && this.isCSSSupport(t2)) {
				anis = {};
				anis.transform = t;
				anis.transition = t2;
				anis.keyframes = k;
				anis.animation = a;
				anis.perspective = p;
				anis.aniTimeFunc = af;
				anis.origin = o;
				anis.transformStyle = s;
				anis.delay = d;
				anis.duration = du;
				break;
			}//end if
		}//end for
		if (anis) {
			anis.eventAnimationend = (anis.transform.match(/webkit/i)) ? 'webkitAnimationEnd' : 'animationend';
			anis.eventTransition = (anis.transform.match(/webkit/i)) ? 'webkitTransitionEnd' : 'transitionend';
		}//end if
		return anis;
	}
};

init = {
	data: {},
	ens: {},
	path4EXIFReader: '/js/ExifReader-min.js',
	uri4Upload: 'pasteItFunc.php',
	//method
	xhrHandle: function(e) {
		var ResultObj, percentage;
		switch (e.type.toLowerCase()) {
			case 'progress':
				if (e.lengthComputable) {
					 percentage = Math.round((e.loaded * 100) / e.total);
					 console.log('progress: '+percentage);
				}//end if
				break;
			case 'load':
				percentage = 100;
				console.log('progress: '+percentage);
				break;
			case 'readystatechange':
				if (this.readyState == 4) {
					console.log('query done.');

					ResultObj = {info:'fail'};
					if (this.status == 200) {
						try {ResultObj=JSON.parse(this.responseText.replace(/\)\]\}',\n/, ''));} catch(err) {}
					}//end if
				}//end if
				break;
			default:
				// trace(obj.a);
		}//end switch
	},
	upload: function(action, imageData) {
		var xhr = new XMLHttpRequest(),
			fd = new FormData(),
			sets = ['progress', 'load'],
			uri;

		// uri = 'pasteItFunc.php';
		uri = this.uri4Upload;
		fd.append('action', action);
		fd.append('Filedata', action == 'drop' ? imageData.blob : imageData.dataURL);

		//evt
		for (var j=-1,l2=sets.length;++j<l2;) xhr.upload['on'+sets[j]] = this.xhrHandle;
		sets = ['abort', 'error', 'readystatechange'];
		for (var j=-1,l2=sets.length;++j<l2;) xhr['on'+sets[j]] = this.xhrHandle;

		xhr.open('POST', uri, true);
		xhr.send(fd);
	},
	readAsArrayBuffer: function(file, idx) {
		var reader;
		reader = new FileReader();
		reader.onload = reader.onerror = function(evt) {
			var orientation;
			if (evt.type.toLowerCase() == 'load') {
				orientation = 1;
				EXIF = new ExifReader();
				try {
					EXIF.load(evt.target.result);
					tags = EXIF.getAllTags();
					orientation = (tags.Orientation) ? tags.Orientation.value : 1;
				} catch (err) {}
				init.readImg(file, orientation, idx);
			}//end if
		};
		reader.readAsArrayBuffer(file);
	},
	readImg: function(file, orientation, idx) {
		var image;
		
		image = new Image();
		image.idx = (typeof idx == 'undefined') ? 0 : idx;
		image.onload = function() {
			init.shot(this, orientation);
		};
		image.src = (typeof file == 'string') ? file : this.ens.URL.createObjectURL(file);
	},
	shot: function(image, orientation) {
		var thumbnail, original, size, ctxO, ctxT, thumbnailF; 

		try {
			this.ens.URL.revokeObjectURL(image);
		} catch(err) {}

		size = (orientation < 5) ? {oW:image.width, oH:image.height} : {oW:image.height, oH:image.width};
		size.sW = this.data.thumbnailWH;
		if (size.oW < size.oH) {
			size.tW = size.sW;
			size.tH = (size.oH * size.sW) / size.oW;
			size.x = 0;
			size.y = (size.tH - size.sW) / 2 * -1;
		} else {
			size.tW = (size.oW * size.sW) / size.oH;
			size.tH = size.sW;
			size.x = (size.tW - size.sW) / 2 * -1;
			size.y = 0;
		}//end if

		//canvas
		original = document.createElement('canvas');
		original.width = size.oW;
		original.height = size.oH;
		ctxO = original.getContext('2d');
		thumbnail = document.createElement('canvas');
		thumbnail.width = size.tW;
		thumbnail.height = size.tH;
		ctxT = thumbnail.getContext('2d');
		thumbnailF = document.createElement('canvas');
		thumbnailF.width = size.sW;
		thumbnailF.height = size.sW;
		switch (orientation) {
			case 2:
				ctxO.translate(size.oW, 0);
				ctxO.scale(-1, 1);
				ctxT.translate(size.tW, 0);
				ctxT.scale(-1, 1);
				break;
			case 3:
				ctxO.translate(size.oW, size.oH);
				ctxO.rotate(180 * Math.PI/180);
				ctxT.translate(size.tW, size.tH);
				ctxT.rotate(180 * Math.PI/180);
				break;
			case 4:
				ctxO.translate(0, size.oH);
				ctxO.scale(1, -1);
				ctxT.translate(0, size.tH);
				ctxT.scale(1, -1);
				break;
			case 5:
				ctxO.translate(0, 0);
				ctxO.scale(1, -1);
				ctxO.rotate(270 * Math.PI/180);
				ctxT.translate(0, 0);
				ctxT.scale(1, -1);
				ctxT.rotate(270 * Math.PI/180);
				break;
			case 6:
				ctxO.translate(size.oW, 0);
				ctxO.rotate(90 * Math.PI/180);
				ctxT.translate(size.tW, 0);
				ctxT.rotate(90 * Math.PI/180);
				break;
			case 7:
				ctxO.translate(size.oW, size.oH);
				ctxO.scale(1, -1);
				ctxO.rotate(90 * Math.PI/180);
				ctxT.translate(size.tW, size.tH);
				ctxT.scale(1, -1);
				ctxT.rotate(90 * Math.PI/180);
				break;
			case 8:
				ctxO.translate(0, size.oH);
				ctxO.rotate(-90 * Math.PI/180);
				ctxT.translate(0, size.tH);
				ctxT.rotate(-90 * Math.PI/180);
				break;
		}//end switch
		if (orientation < 5) {
			ctxO.drawImage(image, 0, 0, size.oW, size.oH);
			ctxT.drawImage(image, 0, 0, size.tW, size.tH);
		} else {
			ctxO.drawImage(image, 0, 0, size.oH, size.oW);
			ctxT.drawImage(image, 0, 0, size.tH, size.tW);
		}//end if
		thumbnailF.getContext('2d').drawImage(thumbnail, size.x, size.y, size.tW, size.tH);

		this.data.final.push(
			{
				thumbnail: thumbnailF.toDataURL('image/png'),
				original: original.toDataURL('image/png'),
				idx: image.idx
			}
		);

		if (this.data.final.length == this.data.imageData.length) this.show();
	},
	prepare: function(action) {
		this.data.final = [];
		this.data.active = false;
		this.data.thumbnailWH = tRy.getPageSize()[2] * 0.94 * 0.94;
		this.data.thumbnailWH *= (init.data.imageData.length >= 3) ? 0.32 : ((init.data.imageData.length == 2) ? 0.49 : .5);

		this.ens.entry.classList.add('process');
		if (action == 'drop') {
			this.data.imageData.forEach(
				function(imgData, idx) {
					this.readAsArrayBuffer(imgData.blob, idx);
				}
			, this);
		} else {
			this.data.imageData.forEach(
				function(imgData) {
					this.readImg(imgData.dataURL, 1);
				}
			, this);
		}//end if
	},
	generate: function() {
		var col;

		this.data.imageData = [];
		this.data.active = false;

		this.ens.input.checked = false;
		this.ens.entry.classList.remove('process');
		if (this.ens.label.parentNode) this.ens.label.parentNode.removeChild(this.ens.label);
		while(this.ens.ul.childNodes.length) this.ens.ul.removeChild(this.ens.ul.firstChild);

		col = this.data.final.length;
		if (col >= 3) col = 3;

		this.ens.dialog.setAttribute('data-column', col);

		this.data.final.sort(
			function(a, b) {
				return (a.idx < b.idx) ? -1 : ((a.idx > b.idx) ? 1 : 0);
			}
		).forEach(
			function(imageData) {
				var li;
				li = this.ens.template.cloneNode(true);
				li.querySelector('img').src = imageData.thumbnail;
				this.ens.ul.appendChild(li);
			}
		, this);

		if (this.data.final.length > 9) {
			col = this.data.final.length - 9;
			this.ens.label.setAttribute('data-info', '+'+col);
			this.ens.ul.querySelector('li:nth-child(9)').appendChild(this.ens.label);
		}//end if

		this.ens.dialog.classList.add('act');
	},
	show: function() {
		if (this.ens.dialog.classList.contains('act')) {
			this.data.active = true;
			this.ens.dialog.classList.remove('act');
		} else {
			this.generate();
		}//end if
	},
	callBack: function(target, action, imageData) {
		var img, label;
		console.log(action);

		label = target.parentNode;
		switch(action) {
			case 'dragover':
				if (!label.classList.contains('droparea')) label.classList.add('droparea');
				break;
			case 'dragenter':
				if (!label.classList.contains('droparea')) label.classList.add('droparea');
				break;
			case 'dragleave':
				if (label.classList.contains('droparea')) label.classList.remove('droparea');
				break;
			case 'prepare':
				break;
			default:
				//paste, drop
				if (label.classList.contains('droparea')) label.classList.remove('droparea');
				if (!imageData || !imageData.length) return;
				
				//upload
				imageData.forEach(
					function(data) {
						// init.upload(action, data);
					}
				);

				//genImageData
				init.data.imageData = imageData.slice(0);
				init.prepare(action);
		}//end switch
	},
	eAct: function(e) {
		var obj;

		obj = tRy.tNa(e);
		if (!obj.t) return;

		switch (obj.a) {
			case 'keyup':
				if (e.keyCode == 27 && init.ens.lightbox.classList.contains('act')) init.ens.close.click();
				break;
			case 'click':
				if (/label/i.test(obj.t.tagName)) return;

				// tRy.stopEvents(e);
				if (/a/i.test(obj.t.tagName)) {
					if (obj.t.classList.contains('close')) {
						tRy.stopEvents(e);
						init.ens.lightbox.classList.remove('act');
						init.ens.download.removeAttribute('href');
						init.ens.lImg.removeAttribute('src');
					}//end if
				} else {
					tRy.stopEvents(e);
					obj = tRy.eTrack(obj.t, 'li');
					if (!obj) return;
					obj = [].slice.call(init.ens.ul.querySelectorAll('li')).indexOf(obj);

					//lightbox
					init.ens.download.href = init.data.final[obj].original;
					init.ens.lImg.src = init.data.final[obj].original;
					init.ens.lightbox.classList.add('act');
				}//end if
				break;
			default:
				if (!this.classList.contains('act') && init.data.active) {
					init.data.active = false;
					init.generate();
				}//end if
		}//end switch
	},
	go: function() {
		var e, anis;

		e = {};
		anis = tRy.isAniSupport();

		//DOM
		e.textarea = document.querySelector('textarea');

		e.buffer = document.createDocumentFragment();
		e.dialog = document.createElement('aside');
		e.dialog.classList.add('dialog');
		e.dialog.setAttribute('data-column', 1);
		e.buffer.appendChild(e.dialog);
		e.h3 = document.createElement('h3');
		e.h3.appendChild(document.createTextNode('Image thumbnails'));
		e.dialog.appendChild(e.h3);
		e.input = document.createElement('input');
		e.dialog.appendChild(e.input);
		e.input.type = 'checkbox';
		e.input.id = 'triggr4More';
		e.ul = document.createElement('ul');
		e.dialog.appendChild(e.ul);
		e.ul.classList.add('mei-g');
		e.label = document.createElement('label');
		e.label.htmlFor = 'triggr4More';
		e.dialog.appendChild(e.label);

		e.template = document.createDocumentFragment();
		e.li = document.createElement('li');
		e.li.classList.add('mei-u');
		e.template.appendChild(e.li);
		e.a = document.createElement('a');
		e.li.appendChild(e.a);
		e.img = document.createElement('img');
		e.a.appendChild(e.img);
		document.querySelector('section').appendChild(e.buffer);

		e.lightbox = document.createElement('div');
		e.lightbox.className = 'lightbox';
		e.lightbox.setAttribute('data-effect', 'on');
		e.lImg = document.createElement('img');
		e.lightbox.appendChild(e.lImg);
		e.close = document.createElement('a');
		e.lightbox.appendChild(e.close);
		e.close.href = '#close';
		e.close.textContent = "close";
		e.close.title = "turn off lightbox";
		e.close.className = 'close';

		e.download = document.createElement('a');
		e.lightbox.appendChild(e.download);
		e.download.download = 'pasteIt_export.png';
		e.download.textContent = "download";
		e.download.title = "export image";
		e.download.className = 'download';
		document.body.appendChild(e.lightbox);

		//bind
		this.data.active = false;
		this.ens.URL = window.URL || window.webkitURL;
		this.ens.entry = document.querySelector('form label');
		['dialog', 'ul', 'input', 'textarea', 'label', 'template', 'lightbox', 'lImg', 'close', 'download'].forEach(
			function(key) {
				this.ens[key] = e[key];
			}
		, this);

		//evt
		this.ens.textarea.addCallback(init.callBack);
		if (typeof anis != 'undefined') {
			//css
			tRy.createCSSClass('.dialog[data-column]', 'will-change:' + anis.transform + ',opacity;' + anis.origin + ':50% -24px;' + anis.transition + ':' + anis.transform + ' 300ms cubic-bezier(.17,.67,.5,1.7),opacity 300ms cubic-bezier(.17,.67,.5,1.7);'+ anis.transform + ':scale(.001);opacity:0;');
			tRy.createCSSClass('.dialog[data-column].act', anis.transform + ':scale(1);opacity:1;');
			tRy.createCSSClass('.lightbox[data-effect]', 'will-change:background;background:rgba(0,0,0,0);'+anis.transition+':background 350ms cubic-bezier(.17,.67,.5,1.7);');
			tRy.createCSSClass('.lightbox[data-effect] img', 'will-change:'+anis.transform+';'+anis.transition+':'+anis.transform+' 350ms cubic-bezier(.17,.67,.5,1.7);'+anis.transform+':scale(.001);');
			tRy.createCSSClass('.lightbox[data-effect] .close', 'will-change:'+anis.transform+';'+anis.transition+':'+anis.transform+' 250ms 300ms cubic-bezier(.17,.67,.5,1.7);'+anis.transform+':scale(.001);');
			tRy.createCSSClass('.lightbox[data-effect] .download', 'will-change:'+anis.transform+';'+anis.transition+':'+anis.transform+' 250ms 350ms cubic-bezier(.17,.67,.5,1.7);'+anis.transform+':scale(.001);');

			tRy.createCSSClass('.dialog[data-column].act', anis.transform + ':scale(1);opacity:1;');
			tRy.createCSSClass('.lightbox[data-effect].act', 'height:100%;background:rgba(0,0,0,.7);');
			tRy.createCSSClass('.lightbox[data-effect].act img', anis.transform+':scale(1);');
			tRy.createCSSClass('.lightbox[data-effect].act .close', anis.transform+':scale(1);');
			tRy.createCSSClass('.lightbox[data-effect].act .download', anis.transform+':scale(1);');

			this.ens.dialog.addEventListener(anis.eventTransition, this.eAct, false);
			this.ens.ul.addEventListener('click', this.eAct, false);
			this.ens.close.addEventListener('click', this.eAct, false);
			this.ens.download.addEventListener('click', this.eAct, false);
			document.body.addEventListener('keyup', this.eAct, false);
		}//end if
	}
};

function pageInit() {
	var textarea, iid, counter, max, EXIFReader;

	//EXIFReader
	EXIFReader = document.createElement('script');
	EXIFReader.src = init.path4EXIFReader;
	document.head.appendChild(EXIFReader);

	//textarea
	textarea = document.querySelector('textarea');
	counter = 0;
	max = 10000; //10 seconds
	iid = setInterval(
		function() {
			counter += 5;
			if (counter >= max) {
				clearInterval(iid);
				return;
			}//end if
			if (typeof textarea.addCallback != 'undefined' && typeof ExifReader != 'undefined') {
				clearInterval(iid);
				init.go();
			}//end if
		}
	, 5);
}
/*programed by mei(李維翰), http://www.facebook.com/mei.studio.li*/