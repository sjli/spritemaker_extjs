
/*
 * EasyCanvas - v1.0
 * Copyright (c) 2011-12013
 * http://www.ued-lab.com
 * @description EasyCanvas is a tiny Framework for canvas drawing, game and animation building,
 *               which is require Underscore and BackBone for Model and Event
 * @author james.li0122@gmail.com     
 */


(function(Backbone) {


  /**
   * @framwork EC
   * @public
   * @property {class} Layer
   * @property {class} Graph
   * @description Main export object
   */
  var EC = {};


  /**
   * @private
   * @description extend object
   */
  var _extend = function(_target, o) {
    if (IsType.isObject(o)) {
      for (var i in o) {
        if (o.hasOwnProperty(i))
          _target[i] = o[i];
      }
    }
  }

  /**
   * DOM Event Helper
   * @private
   * @description dom event register from Dean Edwards
   * @link http://dean.edwards.name/weblog/2005/10/add-event/
   * @property {fn} add
   * @property {fn} del 
   */
  var DOMEvent = {
    _uid: 1,

    add: function(elm, type, fn) {
      if (!fn._uid) fn._uid = this._uid++;

      if (!elm.events) elm.events = {};

      var handlers = elm.events[type];
  
      if (!handlers) {
        handlers = elm.events[type] = {};
        
        if (elm["on" + type]) {
          handlers[0] = elm["on" + type];
        }
      }
      
      handlers[fn._uid] = fn;
      
      elm["on"+type] = this.handle;
    },

    handle: function(event) {
      var returnValue = true;

      event = event || DOMEvent.fixIE(window.event);
      
      var handlers = this.events[event.type];
      
      for (var i in handlers) {
        this._handler = handlers[i];
        if (this._handler(event) === false) {
          returnValue = false;
        }
      }
      
      return returnValue;
    },

    fixIE: function(event) {
      event.stopPropagation = function() {
        this.cancelBubble = true;
      };
      
      event.preventDefault = function() {
        this.returnValue = false;
      };
      
      return event;
    },

    del: function(elm, type, fn) { 
      if (elm.events && elm.events[type]) {
        delete elm.events[type][fn._uid];
      }
    }
  };



  /**
   * IsType: value type detector
   * @private
   * @property {fn} isObject
   * @property {fn} isFunction
   * @property {fn} isString
   * @property {fn} isArray
   */
  var IsType = {
    toString: Object.prototype.toString,
    isObject: function(o) {
      var str =  this.toString.call(o),
          reg = /^\[object (?!(Array|Function|String)\]$)/i;
      return reg.test(str);
    },
    isFunction: function(o) {
      // some native function (e.g. alert) not pass the test
      return this.toString.call(o) === "[object Function]";
    },
    isString: function(o) {
      return this.toString.call(o) === "[object String]";
    },
    isArray: function(o) {
      return this.toString.call(o) === "[object Array]";
    }
  };




  /**
   * @extend CanvasRenderingContext2D object
   * @private
   * @property {array} currentTransform
   * @property {fn} centerRotate: rotate context round centain point
   * @property {fn} flipH
   * @property {fn} flipV
   * @property {array} graphs: graph instances in the context
   * @property {fn} reRender: redraw all graphs in the context
   * @property {fn} clear: clear context [and all graphs in the context]
   */

  function _enhanceCTX(ctx) {
    var proto = ctx.constructor.prototype;
  
    ctx.currentTransform = [1, 0, 0, 1, 0, 0];
    ctx.transformStore = [];
    
    ctx.setTransform = function() {
      proto.setTransform.apply(this, arguments);
      ctx.currentTransform = Array.prototype.slice.call(arguments, 0);
    };
    
    ctx.transform=function() {
      proto.transform.apply(this, arguments);
      //matrix multiply
      var m = ctx.currentTransform;
      var n = arguments;
      ctx.currentTransform = mtxMultiply(m,n);
    };
    
    ctx.translate = function() {
      proto.translate.apply(this, arguments);
      ctx.currentTransform[4] += arguments[0];
      ctx.currentTransform[5] += arguments[1];
    };
    
    ctx.scale = function() {
      proto.scale.apply(this, arguments);
      ctx.currentTransform[0] *= arguments[0];
      ctx.currentTransform[3] *= arguments[1];
    };
    
    ctx.rotate = function() {
      proto.rotate.call(this, arguments[0]);
      var sin = Math.sin(arguments[0]);
      var cos = Math.cos(arguments[0]);
      var m = ctx.currentTransform;
      var n = [cos, sin, -sin, cos, 0, 0];
      ctx.currentTransform = mtxMultiply(m, n);
    };
    
    ctx.save = function() {
      proto.save.call(this);
      ctx.transformStore.push(ctx.currentTransform.slice(0));
    };
    
    ctx.restore = function() {
      proto.restore.call(this);
      if(ctx.transformStore.length>0)
        ctx.currentTransform = ctx.transformStore.pop();
    };
    
    //1pxfix
    ctx.transform(1, 0, 0, 1, 0.5, 0.5);
  
    /**
      * draw rotate and flips
      */
    //center rotate
    ctx.centerRotate = function(angle, cx, cy) {
        var r = Math.sqrt(cx * cx + cy * cy);
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        var dx = cx * cos + cy * sin;
        var dy = cy * cos - cx * sin;
        
        this.rotate(angle);
        this.translate(-cx, -cy)
        this.translate( dx, dy);
    };
    // flip horizontal
    ctx.flipH = function(cx) {
        this.translate(cx, 0);
        this.scale(-1, 1);
        this.translate(-cx, 0);
    };
    // flip vertical
    ctx.flipV = function(cy) {
        this.translate(0, cy);
        this.scale(1, -1);
        this.translate(0, -cy);
    };

    //two transform matrix multiply
    function mtxMultiply(m,n) {
      var a = m[0] * n[0] + m[1] * n[2],
          b = m[0] * n[1] + m[1] * n[3],
          c = m[2] * n[0] + m[3] * n[2],
          d = m[2] * n[1] + m[3] * n[3],
          e = m[4] * n[0] + m[5] * n[2] + n[4],
          f = m[4] * n[1] + m[5] * n[3] + n[5];
      
      return [a, b, c, d, e, f];
    }

    //two transform matrix division
    function mtxDivision(v,m){
      var x = (m[3] * (v[0] - m[4]) - m[2] * (v[1] - m[5]))/(m[0] * m[3] - m[1] * m[2]),
          y = (m[0] * (v[1] - m[5]) - m[1] * (v[0] - m[4]))/(m[0] * m[3] - m[1] * m[2]);
      return [x, y];
    }

    // 创建用于保存图形数据的存储器
    ctx.graphs = [];

    ctx.reRender = function() {
      var graphs = this.graphs,
          len = graphs.length,
          i = 0;

      this.clearRect(0, 0, Layer.viewport.width, Layer.viewport.height);

      for (; i < len; i++) {
        graphs[i].render();
      }
    };

    ctx.clear = function(clearGraph) {
      if (clearGraph === true) {
        this.graphs = [];
      }
      this.clearRect(0, 0, Layer.viewport.width, Layer.viewport.height);
    };
  }


  /**
   * animation
   * @private
   * @exports {array} Layer.aniLayers: animation update layers
   * @exports {object} Layer.animate: animate control object
   *
   * Layer.animate
   * @property {fn} start
   * @property {fn} stop
   * @property {fn} restart
   */
  //animation
  function _animation() {
    var request = (function(callback) {
          return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function(callback){
            window.setTimeout(callback, 1000 / 60);
          };
        })();
        
    Layer.aniLayers = [];

    function clearStage() {
      Layer.aniLayers.forEach(function(v) {
        v._aniClear();
      });
    }
    function updateStage() {
      Layer.aniLayers.forEach(function(v) {
        v._aniUpdate();
      });
      //moves update
      if (Layer.moves.length > 0) {
        var time1 = new Date().getTime();
        Layer.moves.forEach(function(v) {
          v._update(time1);
        });
      }
    }
    function renderStage() {
      Layer.aniLayers.forEach(function(v) {
        v._aniRender();
      });
    }


    Layer.animate = {
      start: function() {

        this.started = true;

        clearStage();
        updateStage();
        renderStage();

        request(function() {
          Layer.animate.start();
        });

      },

      stop: function() {
        this.started = false;
        Layer.tempRequest = request;
        request = function() {};
      },

      restart: function() {
        request = Layer.tempRequest || request;
        this.start();
      }
    };
  }

  /**
   * @private
   * animation Easing functions
   * from jquery animation & jquery.easing plugin
   * @link https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
   * @params (x, t, b, c, d)  refer to (percent, duration*percent, 0, 1, duration)
   */
  var Easing = {
    linear: function(x) {
      return x;
    },
    swing: function(x) {
      return 0.5 - Math.cos( x*Math.PI ) / 2;
    },
    easeInQuad: function (x, t, b, c, d) {
      return c*(t/=d)*t + b;
    },
    easeOutQuad: function (x, t, b, c, d) {
      return -c *(t/=d)*(t-2) + b;
    },
    easeInOutQuad: function (x, t, b, c, d) {
      if ((t/=d/2) < 1) return c/2*t*t + b;
      return -c/2 * ((--t)*(t-2) - 1) + b;
    },
    easeInCubic: function (x, t, b, c, d) {
      return c*(t/=d)*t*t + b;
    },
    easeOutCubic: function (x, t, b, c, d) {
      return c*((t=t/d-1)*t*t + 1) + b;
    },
    easeInOutCubic: function (x, t, b, c, d) {
      if ((t/=d/2) < 1) return c/2*t*t*t + b;
      return c/2*((t-=2)*t*t + 2) + b;
    },
    easeInQuart: function (x, t, b, c, d) {
      return c*(t/=d)*t*t*t + b;
    },
    easeOutQuart: function (x, t, b, c, d) {
      return -c * ((t=t/d-1)*t*t*t - 1) + b;
    },
    easeInOutQuart: function (x, t, b, c, d) {
      if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
      return -c/2 * ((t-=2)*t*t*t - 2) + b;
    },
    easeInQuint: function (x, t, b, c, d) {
      return c*(t/=d)*t*t*t*t + b;
    },
    easeOutQuint: function (x, t, b, c, d) {
      return c*((t=t/d-1)*t*t*t*t + 1) + b;
    },
    easeInOutQuint: function (x, t, b, c, d) {
      if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
      return c/2*((t-=2)*t*t*t*t + 2) + b;
    },
    easeInSine: function (x, t, b, c, d) {
      return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
    },
    easeOutSine: function (x, t, b, c, d) {
      return c * Math.sin(t/d * (Math.PI/2)) + b;
    },
    easeInOutSine: function (x, t, b, c, d) {
      return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
    },
    easeInExpo: function (x, t, b, c, d) {
      return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
    },
    easeOutExpo: function (x, t, b, c, d) {
      return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
    },
    easeInOutExpo: function (x, t, b, c, d) {
      if (t==0) return b;
      if (t==d) return b+c;
      if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
      return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function (x, t, b, c, d) {
      return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
    },
    easeOutCirc: function (x, t, b, c, d) {
      return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
    },
    easeInOutCirc: function (x, t, b, c, d) {
      if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
      return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
    },
    easeInElastic: function (x, t, b, c, d) {
      var s=1.70158;var p=0;var a=c;
      if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
      if (a < Math.abs(c)) { a=c; var s=p/4; }
      else var s = p/(2*Math.PI) * Math.asin (c/a);
      return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    },
    easeOutElastic: function (x, t, b, c, d) {
      var s=1.70158;var p=0;var a=c;
      if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
      if (a < Math.abs(c)) { a=c; var s=p/4; }
      else var s = p/(2*Math.PI) * Math.asin (c/a);
      return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
    },
    easeInOutElastic: function (x, t, b, c, d) {
      var s=1.70158;var p=0;var a=c;
      if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
      if (a < Math.abs(c)) { a=c; var s=p/4; }
      else var s = p/(2*Math.PI) * Math.asin (c/a);
      if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
      return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
    },
    easeInBack: function (x, t, b, c, d, s) {
      if (s == undefined) s = 1.70158;
      return c*(t/=d)*t*((s+1)*t - s) + b;
    },
    easeOutBack: function (x, t, b, c, d, s) {
      if (s == undefined) s = 1.70158;
      return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    },
    easeInOutBack: function (x, t, b, c, d, s) {
      if (s == undefined) s = 1.70158; 
      if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
      return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
    },
    easeInBounce: function (x, t, b, c, d) {
      return c - this.easeOutBounce (x, d-t, 0, c, d) + b;
    },
    easeOutBounce: function (x, t, b, c, d) {
      if ((t/=d) < (1/2.75)) {
        return c*(7.5625*t*t) + b;
      } else if (t < (2/2.75)) {
        return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
      } else if (t < (2.5/2.75)) {
        return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
      } else {
        return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
      }
    },
    easeInOutBounce: function (x, t, b, c, d) {
      if (t < d/2) return this.easeInBounce (x, t*2, 0, c, d) * .5 + b;
      return this.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
    }
  }

  /**
   * @class Move
   * @private
   * @attribute o {object}: during, easing, callback
   * callback @return {number} percent from 0 to 1 
   *
   */
  var Move = Backbone.Model.extend({
    initialize: function(o) {
      _extend(this, o);

      this._time0 = new Date().getTime();
      if (!Easing[this.easing]) {
        this.easing = 'linear';
      }

      Layer.moves.push(this);

      // move without animation frame
      if (!Layer.animate.started) {
        this._start();
      }
    },

    _update: function(t) {
      this._time1 = t;
      this.percent0 = (this._time1 - this._time0) / this.during;

      if (this.percent0 >= 1) {
        this._stop();
        this.callback(1);
      } else {
        this.percent1 = Easing[this.easing](this.percent0, this.during * this.percent0, 0, 1, this.during);
        this.callback(this.percent1);
      }
    },

    _stop: function() {
      if (this._timer) {
        clearInterval(this._timer);
       delete this._timer;
      }
      var ind = Layer.moves.indexOf(this);
      if (ind > -1)
        Layer.moves.splice(ind, 1);
    },

    _start: function() {
      var This = this, t;
      this._timer = setInterval(function() {
        t = new Date().getTime();
        This._update(t);
      }, 10);
    }
  })



  /**
   * @class Viewport
   * @private
   * @export {object} Layer.viewport
   *
   * Layer.viewport
   * @descrpition a viewport is a drawing area, with multi layers(canvas)
   * @property {dom} elm: the viewport element, parentNode of canvases
   * @property {number} width
   * @property {number} height
   * @property {number} x: current x coordinate from left 0 to right width, when mouse on viewport
   * @property {number} y: current y coordinate from top 0 to bottom height, when mouse on viewport
   * @property {fn} resize: resize the viewport with attribute {width, height}
   */

  var Viewport = Backbone.Model.extend({
    width: 200,
    height: 200,
    domId: 'viewport',
    initialize: function(domId) {
      this.elm = document.getElementById(domId || this.domId);
      if (!this.elm) {return;}
      this.width = this.elm.offsetWidth || this.width;
      this.height = this.elm.offsetHeight || this.height;
      this.initPos();
      this.posEvents();
    },

    resize: function(o, reRenderCTXs) {
      if (!IsType.isObject(o)) {return;}
      if (o.width) {
        this.width = o.width;
        this.elm.style.width = o.width + 'px';
        [].forEach.call(this.elm.children, function(v, i) {
          v.width = o.width;
        });
      } 
      if (o.height) {
        this.height = o.height;
        this.elm.style.height = o.height + 'px';
        [].forEach.call(this.elm.children, function(v, i) {
          v.height = o.height;
        });
      }
      if (!reRenderCTXs) {return;}
      if (IsType.isArray(reRenderCTXs)) {
        reRenderCTXs.forEach(function(v) {
          v.reRender();
        });
      } else if (IsType.isObject(reRenderCTXs)) {
        reRenderCTXs.reRender();
      }
    },

    initPos: function() {
      function pageX(elm) {
        return elm.offsetParent ? 
        pageX(elm.offsetParent) + elm.offsetLeft : elm.offsetLeft;
      }

      function pageY(elm) {
        return elm.offsetParent ? 
        pageY(elm.offsetParent) + elm.offsetTop : elm.offsetTop; 
      }
      this.ox = pageX(this.elm);
      this.oy = pageY(this.elm);
    },

    posEvents: function() {

      var This = this;

      DOMEvent.add(window, 'scroll', _fixScroll);
      DOMEvent.add(window, 'load', _fixScroll);
      DOMEvent.add(window, 'resize', _fixScroll);
      DOMEvent.add(this.elm, 'mousemove', _setPos);
      DOMEvent.add(this.elm, 'mouseout', _clearPos);

      function _fixScroll() {
        This.clientX = This.ox - document.documentElement.scrollLeft;
        This.clientY = This.oy - document.documentElement.scrollTop;
      }

      this._fixScroll = _fixScroll;

      function _setPos(e) {
        if (This.x) {
          This.x0 = This.x;
          This.y0 = This.y;
        }

        _fixTouch(e);

        This.x = e.clientX - This.clientX;
        This.y = e.clientY - This.clientY;
      }

      function _clearPos(e) {
        delete This.x;
        delete This.y;
      }

      function _fixTouch(e) {
        // make clientX and Y compatible to touch event
        // notice: reset e.clientX,Y in desktop opera will throw exception, so should put it in if statement.
        if (e.touches) {
          e.clientX = e.touches[0].clientX;
          e.clientY = e.touches[0].clientY;
        }
      }
    }
  });





  /**
   * @class Layer
   * @public as EC.Layer
   * @classProperty {object} viewport: instance of Viewport
   * @classProperty {array} moves: list of instance of Move
   * @classProperty {object} animate: animation controler with start, stop, restart methods
   * 
   * @instance 
   * @description each layer as the specific drawing layer based on specific canvas
   * @property {string} customId: used to set the layer canvas id
   * @property {dom} canvas
   * @property {object} ctx
   * @property {fn} update: the specific update function for updating status of canvas animation
   */
  var Layer = Backbone.Model.extend({

    initialize: function(customId) {
      // init viewport
      if (!Layer.viewport) {
        Layer.viewport = new Viewport;
      }
      if (!Layer.moves) {
        Layer.moves = [];
      }
      if (!Layer.animate) {
        _animation();
      }

      this.customId = customId || null;

      this._create();

      Layer.viewport._fixScroll();
    },

    _create: function() {
      this.canvas = document.createElement('canvas');
      Layer.viewport.elm.appendChild(this.canvas);
      this.canvas.width = Layer.viewport.width;
      this.canvas.height = Layer.viewport.height;
      this.canvas.style.position = 'absolute';
      this.canvas.id = this.customId ? 'ec_' + this.customId : 'ec_' + this.cid;
      this.ctx = this.canvas.getContext('2d');
      _enhanceCTX(this.ctx);
    },

    _aniClear: function() {
      this.ctx.clearRect(0, 0, Layer.viewport.width, Layer.viewport.height);
    },

    _aniRender: function() {
      var graphs = this.ctx.graphs,
          len = graphs.length,
          i = 0;
      if (len == 0) {return;}

      for (; i < len; i++) {
        graphs[i].render();
      }
    },

    _aniUpdate: function() {},

    update: function(fn) {
      Layer.aniLayers.push(this);
      this._aniUpdate = fn;
    }

  });





  /**
   * @class Graph
   * @public as EC.Graph
   * @classProperty {object} detector: layer instance for graph events detect
   *
   * @instance
   * @property {fn} render: render graph on certain ctx
   * @property {fn} remove: remove the graph from graph list of its ctx
   * @property {fn} on: mouse event listener for graph
   * @property {fn} move: graph move handler, with/without Layer.animate
   * @property {fn} stopMove
   */
  var Graph = Backbone.Model.extend({

    initialize: function(o) {
      _extend(this, o);

      // 绘制一个识别层用于图形的event判断
      if (!Graph.detector) {
        Graph.detector = new Layer('detector');
      }
      

      //events
      this.events();
    },

    render: function(ctx, type) {

      if (!this.ctx) {
        this.ctx = ctx;
        this.renderType = type;
        this.ctx.graphs.push(this);
      }
      
      this._createPath(this.ctx);
      if (this.style) {
        this.ctx.save();
        this._setStyle();
      }
      this._renderType(this.ctx, this.renderType);
      if (this.style) {
        this.ctx.restore();
      }
      return this;
    }, 

    remove: function() {
      var ind = this.ctx.graphs.indexOf(this);
      if (ind > -1) {
        this.ctx.graphs.splice(ind, 1);
      }
    },

    _createPath: function(ctx) {
      if (!this.path) {
        this.path = function() {};
      }
      ctx.beginPath();
      this.path(ctx);
    },

    _renderType: function(ctx, type) {
      var args = arguments, This = this;
      if (IsType.isString(type) && IsType.isFunction(ctx[type])) {
        ctx[type]();
      } else if (IsType.isArray(type)) {
        type.forEach(function(v) {
          args.callee.call(This, ctx, v);
        })
      } else if (IsType.isFunction(type)) {
        type.call(this);
      } else if (!type && IsType.isFunction(this.renderFn)) {
        this.renderFn();
      }
    },

    _setStyle: function() {
      if (!this.style) {return;}
      for (var i in this.style) {
        if (typeof this.ctx[i] == 'string')
          this.ctx[i] = this.style[i];
      }
    },

    events: function() {
      var viewport = Layer.viewport,
          ctx = Graph.detector.ctx,
          This = this;

      this._normalBind(viewport, ctx, This);
      this._specBind(viewport, ctx, This);

      if (this.dragMode === 'normal') {
        this._normalDrag();
      }
    },

    _normalBind: function(viewport, ctx, This) {
      var normalEvents = ["click", "dblclick", "mousedown", "mouseup",
                      "touchstart", "touchmove", "touchend", "touchcancel"];

      normalEvents.forEach(function(v) {
        DOMEvent.add(viewport.elm, v, function(e) {

          // 在识别层上重绘制取path
          This._createPath(ctx);
          if (ctx.isPointInPath(viewport.x, viewport.y)) {
            This.trigger(v);
            if (v === 'mousedown' && This.draggable) {
              This.dragging = true;
              This.trigger('dragstart');
            }
            if (v === 'mouseup') {
              if (This.dragging) {
                This.trigger('dragend');
                This.dragging = false;
              }
            }
          }
        });
      });
    } ,

    //mouseover等需要通过viewport的mousemove判断的事件
    _specBind: function(viewport, ctx, This) {
      DOMEvent.add(viewport.elm, 'mousemove', function(e) {
        This._handleDrag(viewport);

        This._createPath(ctx);
        if (ctx.isPointInPath(viewport.x, viewport.y)) {
          
          if (This.msover) {
            This.trigger('mousemove');
          } else {
            This.msover = true;
            This.trigger('mouseover');
            This.trigger('mouseenter');
          }
        } else if (This.msover) {
          delete This.msover;
          This.trigger('mouseout');
          This.trigger('mouseleave');
        }

      });

      DOMEvent.add(viewport.elm, 'mouseout', function(e) {
        This.dragging = false;
      });
    },

    _handleDrag: function(viewport) {
      var dx = viewport.x - viewport.x0,
          dy = viewport.y - viewport.y0;

      if (this.dragging) {
        //out of viewport
        if (!viewport.x || !viewport.y) {
          return;
        }

        this.trigger('dragging', dx, dy);
      }
    },

    _normalDrag: function() {
      this.on('dragging', function(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.ctx.reRender();
      });
    },

    move: function(ex, ey, during, easing, callback) {
      var x0 = this.x,
          y0 = this.y,
          dx = ex - x0,
          dy = ey - y0,
          This = this;

      this._curMove = new Move({
        'during': during, 
        'easing': easing, 
        'callback': function(p) {
          This.x = x0 + dx * p;
          This.y = y0 + dy * p;
          This.ctx.reRender();
          callback(p);
        }
      });
    },

    stopMove: function() {
      if (this._curMove) {
        this._curMove._stop();
      }
    }

  });

  EC.Layer = Layer;
  EC.Graph = Graph;

  window.EC = EC;


})(Backbone);