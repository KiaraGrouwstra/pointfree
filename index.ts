import * as R from 'ramda';

interface Type<T> extends Function {
  new (...args: any[]): T;
}

// some functions error as soon as you access them...
const safeAccess = <V, T extends { [k: string]: V }>(obj: T) => <K extends keyof T>(k: string): V|null => {
  try {
    return obj[k];
  } catch(e) {}
}

// addArities enum
export const [DYNAMIC, FIXED_EXACT, FIXED_ANY, EVEN_OPTIONAL] = R.range(0, 10);
// limitation of R._arity used in R.curry
const maxArity = (isProto = false) => 10 - (isProto ? 1 : 0);

// get arities of a class / prototype
export const getArities = (isProto = false) => <T extends { [k: string]: Function }>(obj: T) => R.pipe(
  Object.getOwnPropertyNames,
  R.map(safeAccess(obj)),
  R.filter(R.is(Function)),
  R.map(<F extends Function>(f: F) => [f.name, [R.clamp(0, maxArity(isProto), f.length), f.name]]),
  R.fromPairs,
)(obj);

// add versions for different arities
const withLower = (isProto = false, evenOptional = false) => (n: number, k: string) => R.pipe(
  R.inc,
  R.range(0),
  R.map((i: number) => [`${k}${ i + (isProto ? 1 : 0) }`, [i, k]]),
  R.concat([[k, [n, k]]]),
  R.fromPairs,
)(evenOptional ? maxArity(isProto) : n);

// instead of just e.g. `indexOf` (arity 3), also get lower arities, e.g. `indexOf`, `indexOf3`, `indexOf2`, `indexOf1`
const getUsedArities = (isProto: boolean, addArities: number) =>
    //addArities == FIXED_EXACT ? R.identity :
    R.contains(addArities, [FIXED_ANY, EVEN_OPTIONAL]) ?
        R.pipe(R.map(R.apply(withLower(isProto, addArities == EVEN_OPTIONAL))), R.values, R.mergeAll) :
        R.identity; // e.g. addArities == FIXED_EXACT

const dynamify = (isProto: boolean, addArities: number, fn: <T, F extends Function>(n: number, x: T) => F) => addArities == DYNAMIC ?
    R.pipe(R.nthArg(1), R.flip(fn), <F extends Function>(f: F) => (i: number) => f(i - (isProto ? 1 : 0))) :
    fn;

export const curryStatic = <T>(cls: Type<T>, addArities = EVEN_OPTIONAL) => R.pipe(
  getArities(false),
  getUsedArities(false, addArities),
  R.map(R.adjust((k: keyof Type<T>) => cls[k], 1)),
  R.map(R.apply(dynamify(false, addArities, R.curryN))),
)(cls);

export const curryPrototype = <T>(cls: Type<T>, addArities = EVEN_OPTIONAL) => R.pipe(
  getArities(true),
  getUsedArities(true , addArities),
  R.map(R.apply(dynamify(true, addArities, R.invoker))),
)(cls.prototype);

// return curried functions -- subject last for prototype methods (all arities)
const curryBoth = <T>(cls: Type<T>, addArities = EVEN_OPTIONAL) => R.merge(
  curryPrototype(cls, addArities),
  curryStatic(cls, addArities),
);

export default curryBoth;
