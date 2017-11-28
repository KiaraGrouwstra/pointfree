"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var R = require("ramda");
// some functions error as soon as you access them...
var safeAccess = function (obj) {
    return function (k) {
        try {
            return obj[k];
        }
        catch (e) {
            return null;
        }
    };
};
// get functions of a class / prototype
// { [k: string]: Function }
exports.getFunctions = function (obj) { return R.pipe(Object.getOwnPropertyNames, R.map(function (k) { return [k, k]; }), R.fromPairs, R.map(safeAccess(obj)), R.filter(R.is(Function)))(obj); };
// curry functions
exports.curryStatic = function (cls) { return R.pipe(exports.getFunctions, R.map(function (f) { return function () {
    var rest = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        rest[_i] = arguments[_i];
    }
    return function (x) { return f.apply(void 0, [x].concat(rest)); };
}; }))(cls); };
// curry methods
exports.curryPrototype = function (cls) { return R.pipe(exports.getFunctions, R.map(function (f) { return function () {
    var rest = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        rest[_i] = arguments[_i];
    }
    return function (x) { return f.apply(x, rest); };
}; }))(cls.prototype); };
// return curried functions -- subject last for prototype methods (all arities)
var curryBoth = function (cls) { return R.merge(exports.curryPrototype(cls), exports.curryStatic(cls)); };
exports.default = curryBoth;
