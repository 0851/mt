!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.MtPanel=e():t.MtPanel=e()}(window,function(){return function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="/",n(n.s=0)}([function(t,e,n){n(1),t.exports=n(5)},function(t,e,n){"use strict";t.exports=n(2).polyfill()},function(t,e,n){(function(e,n){var r;r=function(){"use strict";function t(t){return"function"==typeof t}var r=Array.isArray?Array.isArray:function(t){return"[object Array]"===Object.prototype.toString.call(t)},o=0,i=void 0,u=void 0,s=function(t,e){p[o]=t,p[o+1]=e,2===(o+=2)&&(u?u(d):w())};var c="undefined"!=typeof window?window:void 0,a=c||{},l=a.MutationObserver||a.WebKitMutationObserver,f="undefined"==typeof self&&void 0!==e&&"[object process]"==={}.toString.call(e),h="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel;function v(){var t=setTimeout;return function(){return t(d,1)}}var p=new Array(1e3);function d(){for(var t=0;t<o;t+=2){(0,p[t])(p[t+1]),p[t]=void 0,p[t+1]=void 0}o=0}var y,m,_,b,w=void 0;function g(t,e){var n=this,r=new this.constructor(j);void 0===r[x]&&Y(r);var o=n._state;if(o){var i=arguments[o-1];s(function(){return F(o,r,i,n._result)})}else k(n,r,t,e);return r}function T(t){if(t&&"object"==typeof t&&t.constructor===this)return t;var e=new this(j);return M(e,t),e}f?w=function(){return e.nextTick(d)}:l?(m=0,_=new l(d),b=document.createTextNode(""),_.observe(b,{characterData:!0}),w=function(){b.data=m=++m%2}):h?((y=new MessageChannel).port1.onmessage=d,w=function(){return y.port2.postMessage(0)}):w=void 0===c?function(){try{var t=Function("return this")().require("vertx");return void 0!==(i=t.runOnLoop||t.runOnContext)?function(){i(d)}:v()}catch(t){return v()}}():v();var x=Math.random().toString(36).substring(2);function j(){}var A=void 0,O=1,S=2;function E(e,n,r){n.constructor===e.constructor&&r===g&&n.constructor.resolve===T?function(t,e){e._state===O?L(t,e._result):e._state===S?C(t,e._result):k(e,void 0,function(e){return M(t,e)},function(e){return C(t,e)})}(e,n):void 0===r?L(e,n):t(r)?function(t,e,n){s(function(t){var r=!1,o=function(t,e,n,r){try{t.call(e,n,r)}catch(t){return t}}(n,e,function(n){r||(r=!0,e!==n?M(t,n):L(t,n))},function(e){r||(r=!0,C(t,e))},t._label);!r&&o&&(r=!0,C(t,o))},t)}(e,n,r):L(e,n)}function M(t,e){if(t===e)C(t,new TypeError("You cannot resolve a promise with itself"));else if(o=typeof(r=e),null===r||"object"!==o&&"function"!==o)L(t,e);else{var n=void 0;try{n=e.then}catch(e){return void C(t,e)}E(t,e,n)}var r,o}function P(t){t._onerror&&t._onerror(t._result),N(t)}function L(t,e){t._state===A&&(t._result=e,t._state=O,0!==t._subscribers.length&&s(N,t))}function C(t,e){t._state===A&&(t._state=S,t._result=e,s(P,t))}function k(t,e,n,r){var o=t._subscribers,i=o.length;t._onerror=null,o[i]=e,o[i+O]=n,o[i+S]=r,0===i&&t._state&&s(N,t)}function N(t){var e=t._subscribers,n=t._state;if(0!==e.length){for(var r=void 0,o=void 0,i=t._result,u=0;u<e.length;u+=3)r=e[u],o=e[u+n],r?F(n,r,o,i):o(i);t._subscribers.length=0}}function F(e,n,r,o){var i=t(r),u=void 0,s=void 0,c=!0;if(i){try{u=r(o)}catch(t){c=!1,s=t}if(n===u)return void C(n,new TypeError("A promises callback cannot return that same promise."))}else u=o;n._state!==A||(i&&c?M(n,u):!1===c?C(n,s):e===O?L(n,u):e===S&&C(n,u))}var q=0;function Y(t){t[x]=q++,t._state=void 0,t._result=void 0,t._subscribers=[]}var D=function(){function t(t,e){this._instanceConstructor=t,this.promise=new t(j),this.promise[x]||Y(this.promise),r(e)?(this.length=e.length,this._remaining=e.length,this._result=new Array(this.length),0===this.length?L(this.promise,this._result):(this.length=this.length||0,this._enumerate(e),0===this._remaining&&L(this.promise,this._result))):C(this.promise,new Error("Array Methods must be provided an Array"))}return t.prototype._enumerate=function(t){for(var e=0;this._state===A&&e<t.length;e++)this._eachEntry(t[e],e)},t.prototype._eachEntry=function(t,e){var n=this._instanceConstructor,r=n.resolve;if(r===T){var o=void 0,i=void 0,u=!1;try{o=t.then}catch(t){u=!0,i=t}if(o===g&&t._state!==A)this._settledAt(t._state,e,t._result);else if("function"!=typeof o)this._remaining--,this._result[e]=t;else if(n===H){var s=new n(j);u?C(s,i):E(s,t,o),this._willSettleAt(s,e)}else this._willSettleAt(new n(function(e){return e(t)}),e)}else this._willSettleAt(r(t),e)},t.prototype._settledAt=function(t,e,n){var r=this.promise;r._state===A&&(this._remaining--,t===S?C(r,n):this._result[e]=n),0===this._remaining&&L(r,this._result)},t.prototype._willSettleAt=function(t,e){var n=this;k(t,void 0,function(t){return n._settledAt(O,e,t)},function(t){return n._settledAt(S,e,t)})},t}();var H=function(){function e(t){this[x]=q++,this._result=this._state=void 0,this._subscribers=[],j!==t&&("function"!=typeof t&&function(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}(),this instanceof e?function(t,e){try{e(function(e){M(t,e)},function(e){C(t,e)})}catch(e){C(t,e)}}(this,t):function(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}())}return e.prototype.catch=function(t){return this.then(null,t)},e.prototype.finally=function(e){var n=this.constructor;return t(e)?this.then(function(t){return n.resolve(e()).then(function(){return t})},function(t){return n.resolve(e()).then(function(){throw t})}):this.then(e,e)},e}();return H.prototype.then=g,H.all=function(t){return new D(this,t).promise},H.race=function(t){var e=this;return r(t)?new e(function(n,r){for(var o=t.length,i=0;i<o;i++)e.resolve(t[i]).then(n,r)}):new e(function(t,e){return e(new TypeError("You must pass an array to race."))})},H.resolve=T,H.reject=function(t){var e=new this(j);return C(e,t),e},H._setScheduler=function(t){u=t},H._setAsap=function(t){s=t},H._asap=s,H.polyfill=function(){var t=void 0;if(void 0!==n)t=n;else if("undefined"!=typeof self)t=self;else try{t=Function("return this")()}catch(t){throw new Error("polyfill failed because global object is unavailable in this environment")}var e=t.Promise;if(e){var r=null;try{r=Object.prototype.toString.call(e.resolve())}catch(t){}if("[object Promise]"===r&&!e.cast)return}t.Promise=H},H.Promise=H,H},t.exports=r()}).call(this,n(3),n(4))},function(t,e){var n,r,o=t.exports={};function i(){throw new Error("setTimeout has not been defined")}function u(){throw new Error("clearTimeout has not been defined")}function s(t){if(n===setTimeout)return setTimeout(t,0);if((n===i||!n)&&setTimeout)return n=setTimeout,setTimeout(t,0);try{return n(t,0)}catch(e){try{return n.call(null,t,0)}catch(e){return n.call(this,t,0)}}}!function(){try{n="function"==typeof setTimeout?setTimeout:i}catch(t){n=i}try{r="function"==typeof clearTimeout?clearTimeout:u}catch(t){r=u}}();var c,a=[],l=!1,f=-1;function h(){l&&c&&(l=!1,c.length?a=c.concat(a):f=-1,a.length&&v())}function v(){if(!l){var t=s(h);l=!0;for(var e=a.length;e;){for(c=a,a=[];++f<e;)c&&c[f].run();f=-1,e=a.length}c=null,l=!1,function(t){if(r===clearTimeout)return clearTimeout(t);if((r===u||!r)&&clearTimeout)return r=clearTimeout,clearTimeout(t);try{r(t)}catch(e){try{return r.call(null,t)}catch(e){return r.call(this,t)}}}(t)}}function p(t,e){this.fun=t,this.array=e}function d(){}o.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)e[n-1]=arguments[n];a.push(new p(t,e)),1!==a.length||l||s(v)},p.prototype.run=function(){this.fun.apply(null,this.array)},o.title="browser",o.browser=!0,o.env={},o.argv=[],o.version="",o.versions={},o.on=d,o.addListener=d,o.once=d,o.off=d,o.removeListener=d,o.removeAllListeners=d,o.emit=d,o.prependListener=d,o.prependOnceListener=d,o.listeners=function(t){return[]},o.binding=function(t){throw new Error("process.binding is not supported")},o.cwd=function(){return"/"},o.chdir=function(t){throw new Error("process.chdir is not supported")},o.umask=function(){return 0}},function(t,e){var n;n=function(){return this}();try{n=n||new Function("return this")()}catch(t){"object"==typeof window&&(n=window)}t.exports=n},function(t,e,n){"use strict";var r,o=this&&this.__extends||(r=function(t,e){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])})(t,e)},function(t,e){function n(){this.constructor=t}r(t,e),t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)}),i=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0}),n(6);var u=i(n(7)),s=function(t){function e(e,n){return t.call(this)||this}return o(e,t),e.prototype.apply=function(t){this.render(),this.toggleTitle()},e.prototype.render=function(){var t=document.createElement("div");t.className="mt-monitor-box",t.innerHTML=u.default,document.body.appendChild(t)},e.prototype.toggleTitle=function(){var t=document.querySelector(".mt-monitor-title"),e=document.querySelector(".mt-monitor-content"),n=!1;if(null!==t&&null!==e){var r=e.className;t.addEventListener("click",function(){null!==t&&null!==e&&(t.innerHTML=!0===n?"缩小":"展开",e.className=!0===n?r:e.className+" hide",n=!n)})}},e}(i(n(8)).default);e.MtPanel=s,e.default=s},function(t,e,n){},function(t,e){t.exports='<div class="mt-monitor-bg"></div><div class="mt-monitor"><div class="mt-monitor-title">缩小</div><div class="mt-monitor-content"> 什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢什么呢</div></div>'},function(t,e,n){"use strict";var r=this&&this.__values||function(t){var e="function"==typeof Symbol&&Symbol.iterator,n=e&&t[e],r=0;if(n)return n.call(t);if(t&&"number"==typeof t.length)return{next:function(){return t&&r>=t.length&&(t=void 0),{value:t&&t[r++],done:!t}}};throw new TypeError(e?"Object is not iterable.":"Symbol.iterator is not defined.")},o=this&&this.__read||function(t,e){var n="function"==typeof Symbol&&t[Symbol.iterator];if(!n)return t;var r,o,i=n.call(t),u=[];try{for(;(void 0===e||e-- >0)&&!(r=i.next()).done;)u.push(r.value)}catch(t){o={error:t}}finally{try{r&&!r.done&&(n=i.return)&&n.call(i)}finally{if(o)throw o.error}}return u},i=this&&this.__spread||function(){for(var t=[],e=0;e<arguments.length;e++)t=t.concat(o(arguments[e]));return t};Object.defineProperty(e,"__esModule",{value:!0});var u=function(){function t(){this.events={}}return t.prototype.on=function(t,e,n){if(!e)throw new ReferenceError("handler not defined");return this.events[t]||(this.events[t]=[]),n&&(e.once=n),this.events[t].push(e),this},t.prototype.once=function(t,e){return this.on(t,e,!0)},t.prototype.off=function(t,e){if(!this.events[t])return this;if(!e)throw new ReferenceError("handler not defined");if("*"===e)return delete this.events[t],this;for(var n=this.events[t];n.includes(e);)n.splice(n.indexOf(e),1);return n.length<1&&delete this.events[t],this},t.prototype.emit=function(t){for(var e,n,o,u,s=this,c=[],a=1;a<arguments.length;a++)c[a-1]=arguments[a];var l=function(t){for(var e,n,o=[],u=1;u<arguments.length;u++)o[u-1]=arguments[u];if(!s.events["*"])return s;var c=s.events["*"];try{for(var a=r(c),l=a.next();!l.done;l=a.next()){var f=l.value;f.call.apply(f,i([s,t],o))}}catch(t){e={error:t}}finally{try{l&&!l.done&&(n=a.return)&&n.call(a)}finally{if(e)throw e.error}}return s};if(!this.events[t])return l.apply(void 0,i([t],c));var f=this.events[t],h=[];try{for(var v=r(f),p=v.next();!p.done;p=v.next()){(m=p.value).apply(this,c),m.once&&h.push(m)}}catch(t){e={error:t}}finally{try{p&&!p.done&&(n=v.return)&&n.call(v)}finally{if(e)throw e.error}}try{for(var d=r(h),y=d.next();!y.done;y=d.next()){var m=y.value;this.off(t,m)}}catch(t){o={error:t}}finally{try{y&&!y.done&&(u=d.return)&&u.call(d)}finally{if(o)throw o.error}}return l.apply(void 0,i([t],c))},t}();e.EventBus=u,e.default=u}])});