"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var noop = function () {
    //
};
var TMap = {
    tap: 'tap',
    async: 'tapAsync',
    promise: 'tapPromise'
};
function hookTap(compiler, hook, fn, name, type) {
    if (fn === void 0) { fn = noop; }
    if (type === void 0) { type = 'tap'; }
    if (compiler.hooks) {
        hook = hook.replace(/-(\w)/g, function (all, letter) {
            return letter.toUpperCase();
        });
        compiler.hooks[hook][TMap[type] || 'tap'](name, fn);
    }
    else {
        compiler.plugin(hook, fn);
    }
}
var MTWebpackPlugin = /** @class */ (function () {
    function MTWebpackPlugin() {
        console.log('===');
    }
    MTWebpackPlugin.prototype.apply = function (compiler) {
        console.log(compiler);
    };
    MTWebpackPlugin.loader = require.resolve('./webpack-loader-cjs.js');
    return MTWebpackPlugin;
}());
exports.default = MTWebpackPlugin;
//# sourceMappingURL=webpack-plugin.js.map