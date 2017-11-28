"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const R = require("ramda");
// some functions error as soon as you access them...
const safeAccess = (obj) => (k) => {
    try {
        return obj[k];
    }
    catch (e) {
        return null;
    }
};
// map object, from Ramda without the `map` dispatch
const mapObject = (fn) => (obj) => R.reduce((acc, key) => {
    acc[key] = fn(obj[key]);
    return acc;
}, {}, R.keys(obj));
// get functions of a class / prototype
// { [k: string]: Function }
exports.getFunctions = (obj) => R.pipe(Object.getOwnPropertyNames, R.map((k) => [k, k]), R.fromPairs, R.filter(R.pipe(safeAccess(obj), R.is(Function))), R.map(safeAccess(obj)))(obj);
// curry functions
exports.curryStatic = (cls) => R.pipe(exports.getFunctions, mapObject((f) => (...rest) => (x) => f(x, ...rest)))(cls);
// curry methods
exports.curryPrototype = (cls) => R.pipe(exports.getFunctions, mapObject((f) => (...rest) => (x) => f.apply(x, rest)))(cls.prototype);
// return curried functions -- subject last for prototype methods (all arities)
const curryBoth = (cls) => R.merge(exports.curryPrototype(cls), exports.curryStatic(cls));
exports.default = curryBoth;
