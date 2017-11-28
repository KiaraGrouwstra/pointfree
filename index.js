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
exports.flipStatic = (cls) => R.pipe(exports.getFunctions, mapObject((f) => (...rest) => (x) => f(x, ...rest)))(cls);
// curry methods
exports.flipPrototype = (cls) => R.pipe(exports.getFunctions, mapObject((f) => (...rest) => (x) => f.apply(x, rest)))(cls.prototype);
// return curried functions -- subject last for prototype methods (all arities)
exports.flipClass = (cls) => R.merge(exports.flipPrototype(cls), exports.flipStatic(cls));
exports.default = exports.flipClass;
// code for curried versions:
// addArities enum
_a = R.range(0, 10), exports.DYNAMIC = _a[0], exports.FIXED_EXACT = _a[1], exports.EVEN_OPTIONAL = _a[2];
// limitation of R._arity used in R.curry
const maxArity = (isProto = false) => 9 - (isProto ? 1 : 0);
// get arities of a class / prototype
exports.getArities = (isProto = false) => (obj) => R.pipe(Object.getOwnPropertyNames, R.filter(R.pipe(safeAccess(obj), R.is(Function))), R.map(R.pipe(safeAccess(obj), (f) => [f.name, [R.clamp(0, maxArity(isProto), f.length), f.name]])), R.fromPairs)(obj);
// add versions for different arities
const withLower = (isProto = false, evenOptional = false) => (n, k) => R.pipe(R.flip(R.range)(1 + maxArity(isProto)), R.map((i) => [`${k}${i + (isProto ? 1 : 0)}`, [i, k]]), R.concat([[k, [n, k]]]), R.fromPairs)(n);
// instead of just e.g. `indexOf` (arity 3), also get lower arities, e.g. `indexOf`, `indexOf3`, `indexOf2`, `indexOf1`
const getUsedArities = (isProto, addArities) => addArities == exports.EVEN_OPTIONAL ?
    R.pipe(R.map(R.apply(withLower(isProto, addArities == exports.EVEN_OPTIONAL))), R.values, R.mergeAll) :
    R.identity;
const dynamify = (isProto, addArities, fn) => addArities == exports.DYNAMIC ?
    R.pipe(R.nthArg(1), R.flip(fn), (f) => (i) => f(i - (isProto ? 1 : 0))) :
    fn;
exports.curryStatic = (cls, addArities = exports.EVEN_OPTIONAL) => R.pipe(exports.getArities(false), getUsedArities(false, addArities), R.map(R.pipe(
// R.adjust((k: keyof Type<T>) => console.log.bind(console), 1),
// R.adjust((k: keyof Type<T>) => cls[k], 1),
R.adjust((k) => (...args) => cls[k](R.last(args), ...R.dropLast(1, args)), 1), R.apply(dynamify(false, addArities, R.curryN)))))(cls);
exports.curryPrototype = (cls, addArities = exports.EVEN_OPTIONAL) => R.pipe(exports.getArities(true), getUsedArities(true, addArities), R.map(R.apply(dynamify(true, addArities, R.invoker))))(cls.prototype);
// return curried functions -- subject last for prototype methods (all arities)
exports.curryClass = (cls, addArities = exports.EVEN_OPTIONAL) => R.merge(exports.curryPrototype(cls, addArities), exports.curryStatic(cls, addArities));
// return curried functions, arities must be explicitly passed
exports.curryNClass = (cls) => exports.curryClass(cls, exports.DYNAMIC);
var _a;
