define(["require", "exports", "ramda"], function (require, exports, R) {
    "use strict";
    // some functions error as soon as you access them...
    var safeAccess = function (obj) { return function (k) {
        try {
            return obj[k];
        }
        catch (e) { }
    }; };
    // addArities enum
    exports.DYNAMIC = (_a = R.range(0, 10), _a[0]), exports.FIXED_EXACT = _a[1], exports.FIXED_ANY = _a[2], exports.EVEN_OPTIONAL = _a[3];
    // limitation of R._arity used in R.curry
    var maxArity = function (isProto) {
        if (isProto === void 0) { isProto = false; }
        return 10 - (isProto ? 1 : 0);
    };
    // get arities of a class / prototype
    exports.getArities = function (isProto) {
        if (isProto === void 0) { isProto = false; }
        return function (obj) { return R.pipe(Object.getOwnPropertyNames, R.map(safeAccess(obj)), R.filter(R.is(Function)), R.map(function (f) { return [f.name, [R.clamp(0, maxArity(isProto), f.length), f.name]]; }), R.fromPairs)(obj); };
    };
    // add versions for different arities
    var withLower = function (isProto, evenOptional) {
        if (isProto === void 0) { isProto = false; }
        if (evenOptional === void 0) { evenOptional = false; }
        return function (n, k) { return R.pipe(R.inc, R.range(0), R.map(function (i) { return ["" + k + (i + (isProto ? 1 : 0)), [i, k]]; }), R.concat([[k, [n, k]]]), R.fromPairs)(evenOptional ? maxArity(isProto) : n); };
    };
    // instead of just e.g. `indexOf` (arity 3), also get lower arities, e.g. `indexOf`, `indexOf3`, `indexOf2`, `indexOf1`
    var getUsedArities = function (isProto, addArities) {
        //addArities == FIXED_EXACT ? R.identity :
        return R.contains(addArities, [exports.FIXED_ANY, exports.EVEN_OPTIONAL]) ?
            R.pipe(R.map(R.apply(withLower(isProto, addArities == exports.EVEN_OPTIONAL))), R.values, R.mergeAll) :
            R.identity;
    }; // e.g. addArities == FIXED_EXACT
    var dynamify = function (isProto, addArities, fn) { return addArities == exports.DYNAMIC ?
        R.pipe(R.nthArg(1), R.flip(fn), function (f) { return function (i) { return f(i - (isProto ? 1 : 0)); }; }) :
        fn; };
    exports.curryStatic = function (cls, addArities) {
        if (addArities === void 0) { addArities = exports.EVEN_OPTIONAL; }
        return R.pipe(exports.getArities(false), getUsedArities(false, addArities), R.map(R.adjust(function (k) { return cls[k]; }, 1)), R.map(R.apply(dynamify(false, addArities, R.curryN))))(cls);
    };
    exports.curryPrototype = function (cls, addArities) {
        if (addArities === void 0) { addArities = exports.EVEN_OPTIONAL; }
        return R.pipe(exports.getArities(true), getUsedArities(true, addArities), R.map(R.apply(dynamify(true, addArities, R.invoker))))(cls.prototype);
    };
    // return curried functions -- subject last for prototype methods (all arities)
    var curryBoth = function (cls, addArities) {
        if (addArities === void 0) { addArities = exports.EVEN_OPTIONAL; }
        return R.merge(exports.curryPrototype(cls, addArities), exports.curryStatic(cls, addArities));
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = curryBoth;
    var _a;
});
