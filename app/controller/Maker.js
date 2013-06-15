Ext.define('Spriter.controller.Maker', {
	extend: 'Ext.app.Controller',

	views: ['Panel1', 'Panel2', 'Tab', 'Save', 'Canvas', 'Code'],

	curTab: 0,

	clipX: 0,

	clipY: 0,

	init: function() {
		var This = this;

		this.defineGraph();

		this.control({
			// init canvas layer
			'spritecanvas': {
				render: function() {
					This.initLayer();
				}
			},

			// toggle tab & init tab
			'spritetab': {
				tabchange: function(panel, newcard) {
					This.curTab = panel.items.findIndex('id', newcard.id);
				},
				render: function(panel) {
					This.curX = This.curY = This.maxY = 0;
				}
			},

			'spritesave': {
				activate: function() {
					// fix down load button not work
					var btn = Ext.ComponentQuery.query('[cls=btn-down]')[this.curTab],
						btnEl = Ext.select('#' + btn.id).elements[0],
						clone = btnEl.cloneNode(true),
						parent = btnEl.parentNode;

						btnEl.style.display = 'none';
						parent.appendChild(clone);

					// update css
					This.updateCss();
				}
			},

			// event: width
			'[id=set-width1]': {
				change: function() {
					if (This.layer) {
						EC.Layer.viewport.resize({'width': parseInt(arguments[0].value)}, This.layer.ctx);
					}
				}
			},

			// event: height
			'[id=set-height1]': {
				change: function() {
					if (This.layer) {
						EC.Layer.viewport.resize({'height': parseInt(arguments[0].value)}, This.layer.ctx);
					}
				}
			},

			// event: padding
			'[id=set-padding1]': {
				render: function() {
					This.padding1 = parseInt(arguments[0].value);
				},
				change: function() {
					This.padding1 = parseInt(arguments[0].value);
				}
			},

			// event: upload1
			'[id=upload1]': {
				render: function() {
					// ext filefield not support multiple, so...
					var upload1 = Ext.select('input#upload1').elements[0];
					if (!upload1) {return;}
					upload1.addEventListener('change', function(e) {This.upload1(e, this);}, false);
				}
			},

			// event: upload1
			'[id=upload2]': {
				render: function() {
					// ext filefield not support multiple, so...
					var upload2 = Ext.select('input#upload2').elements[0];
					if (!upload2) {return;}
					upload2.addEventListener('change', function(e) {This.upload2(e, this);}, false);
				}
			},

			// event: clip
			'[cls=btn-clip]': {
				click: This.clip
			},

			// event: updateCss
			'[cls=btn-update]': {
				click: This.updateCss
			}

			
		});
	},

	// define canvas Graph Class
	defineGraph: function() {
		var This = this;

		this.Graph = EC.Graph.extend({
			initData: function(ctx) {
				this.imgdata = ctx.getImageData(this.x, this.y, this.w, this.h);
			},
			path: function(ctx) {
				ctx.rect(this.x, this.y, this.w, this.h);
			},
			renderFn: function() {
				if (This.curTab == 0) {
					this.ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
				} else {
					this.ctx.putImageData(this.imgdata, this.x, this.y, 0, 0, this.w, this.h);
				}
			},
			draggable: true,
			dragMode: 'normal'
		});
	},

	initLayer: function() {
		this.layer = new EC.Layer('view');
	},

	upload1: function(e, elm) {
		var files = elm.files,
			i = 0,
			imgs = [],
			This = this;
		
		[].forEach.call(files, function(v) {
			var img = document.createElement('img'),
				reader = new FileReader(),
				name = v.name.match(/.*(?=\.\w+$)/)[0];

			if (!/^image\/\w+$/.test(v.type)) {
				alert(v.name + '不是图片哦');
			}

			img.onload = function() {
				imgs.push({
					img: this,
					width: this.width,
					height: this.height,
					name: name
				});
				if (imgs.length == files.length) {
					This.render1(imgs);
				}
			};

			reader.onload = function(e) {
				img.src = e.target.result;
			};

			reader.readAsDataURL(v);
		});
	},

	render1: function(imgs) {
		var This = this;

		//refix canvas ox oy
		EC.Layer.viewport.initPos();

		//active next
		Ext.getCmp('move-next1').setDisabled(false);

		imgs.forEach(function(v) {
			This.curY = This.curX + v.width > EC.Layer.viewport.width ? This.maxY : This.curY;
			This.curX = This.curX + v.width > EC.Layer.viewport.width ? 0 : This.curX;
			
			var graph = new This.Graph({
				x: This.curX,
				y: This.curY,
				w: v.width,
				h: v.height,
				img: v.img,
				name: v.name
			}).render(This.layer.ctx);

			graph.on('dragend', function() {
				This.updateUrl();
				This.updateCss();
			});

			This.curX += v.width + This.padding1;
			This.maxY = Math.max(This.maxY, This.curY + v.height + This.padding1);
			
			if (This.maxY > This.layer.canvas.height) {
				EC.Layer.viewport.resize({'height': This.maxY}, This.layer.ctx);
			}
		});

		this.updateUrl();
	},

	upload2: function(e, elm) {
		var files = elm.files,
			i = 0,
			img = document.createElement('img'),
			reader = new FileReader(),
			name = files[0].name.match(/.*(?=\.\w+$)/)[0],
			data,
			This = this;

		if (files.length == 0) {return;}

		img.onload = function() {
			data = {
				img: this,
				width: this.width,
				height: this.height,
				name: name
			};

			This.layer.ctx.graphs = This.graphs = [];
			EC.Layer.viewport.resize({width: data.width, height: data.height}, This.layer.ctx);
			This.detect(data);
		};

		reader.onload = function(e) {
			img.src = e.target.result;
		};

		reader.readAsDataURL(files[0]);
	},

	detect: function(data) {
		var c = this.layer.canvas,
			t = this.layer.ctx,
			imgData,
			worker = new Worker("lib/workerDetect.js"),
			This = this;

		t.drawImage(data.img, 0, 0, data.width, data.height);
		imgData = t.getImageData(0, 0, data.width, data.height);
		this.spriteName = data.name;
		this.coords = [];

		worker.onmessage = function(e) {
			if (e.data == 'over') {
				t.clearRect(0, 0, c.width, c.height);
				t.drawImage(data.img, 0, 0, c.width, c.height);
				This.render2();
				return;
			}
			var coord = e.data, isInner = false;
			
			for (var i = 0; i < This.coords.length; i++) {
				if (coord.minX >= This.coords[i].x && coord.minY >= This.coords[i].y
					&& coord.maxX <= This.coords[i].x + This.coords[i].w 
					&& coord.maxY <= This.coords[i].y + This.coords[i].h) {
					isInner = true;
					break;
				}
			}

			if (!isInner) {
				This.coords.push({
					x: coord.minX,
					y: coord.minY,
					w: coord.maxX - coord.minX + 1,
					h: coord.maxY - coord.minY + 1
				});
				t.strokeStyle = '#fcc';
				t.strokeRect(coord.minX, coord.minY, coord.maxX - coord.minX, coord.maxY - coord.minY);
			}	
		};

		worker.postMessage(imgData);
	},

	render2: function() {
		var t = this.layer.ctx,
			This = this;

		this.graphs = [];

		//refix canvas ox oy
		EC.Layer.viewport.initPos();

		this.coords.forEach(function(v) {
			var graph = new This.Graph({
				x: v.x,
				y: v.y,
				w: v.w,
				h: v.h
			});
			graph.initData(t);
			graph.render(t);
			graph.on('dragend', function() {
				This.updateUrl();
				This.updateCss();
			});
			This.graphs.push(graph);
		});

		//active next
		Ext.getCmp('move-next2').setDisabled(false);
		Ext.getCmp('move-prev2').setDisabled(false);
		Ext.getCmp('panel2').layout.setActiveItem(1);
		this.updateUrl();
	},

	updateUrl: function() {
		var btn = Ext.ComponentQuery.query('[cls=btn-down]')[this.curTab],
			elms = Ext.select('#' + btn.id).elements,
			btnEl = elms[elms.length - 1],
			data = this.layer.canvas.toDataURL('image/png'),
			downmime = 'image/octet-stream';
			data = data.replace(/image\/\w+/, downmime);
		console.log(btnEl, elms)
		btn.setHref(data);
		btnEl.setAttribute('href', data);
		btnEl.download = this.spriteName ? this.spriteName + '.png' : 'custom.png';
	},

	updateCss: function() {
		var detector = Ext.select('#ec_detector').elements[0],
			pre = Ext.ComponentQuery.query('[cls=set-prefix]')[0].value,
			ind = parseInt(Ext.ComponentQuery.query('[cls=set-name-rule]')[0].getValue()),
			coder = Ext.select('#code').elements[0],
			txt = '',
			bgtxt = '',
			len = this.layer.ctx.graphs.length,
			coma = len == 1 ? '' : ',',
			This = this;

		if (detector) {
			detector.style.display = 'none';
		}
		if (isNaN(ind)) ind = 1;
		
		this.layer.ctx.graphs.forEach(function(v, i) {
			var x = This.clipX - v.x ? This.clipX - v.x + 'px' : '0',
				y = This.clipY - v.y ? This.clipY - v.y + 'px' : '0',
				last = ind == 1 ? (v.name ? v.name : This.spriteName + '_' + i) : i,
				cls = '.' + pre + last;

			txt += '\n' + cls + ' {\n';
			txt += '  width: ' + v.w + 'px;\n';
			txt += '  height: ' + v.h + 'px;\n';
			txt += '  background-position: ' + x + ' ' + y + ';\n';
			txt += '}\n';

			if (i != len - 1) {
				bgtxt += cls + coma + '\n';
			} else {
				bgtxt += cls + ' {\n';
				bgtxt += '  background: url(yourspriteimageurl) -9999px -9999px no-repeat;\n';
				bgtxt += '}\n';
			}
		});

		coder.innerHTML = bgtxt + txt;
	},

	clip: function() {
		var ctx = this.layer.ctx,
			minX = Math.min.apply({}, ctx.graphs.map(function(v) {return v.x})),
			minY = Math.min.apply({}, ctx.graphs.map(function(v) {return v.y})),
			maxX = Math.max.apply({}, ctx.graphs.map(function(v) {return v.x + v.w})),
			maxY = Math.max.apply({}, ctx.graphs.map(function(v) {return v.y + v.h}));
		
		ctx.save();
		EC.Layer.viewport.resize({'width': maxX - minX, 'height': maxY - minY});
		ctx.translate(-minX, -minY);
		ctx.reRender();
		ctx.restore();
		this.clipX = minX;
		this.clipY = minY;
		this.updateUrl();
		this.updateCss();
	}
});