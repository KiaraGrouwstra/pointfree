import * as R from 'ramda';

interface Type<T> extends Function {
  new (...args: any[]): T;
}

// some functions error as soon as you access them...
const safeAccess = <V, T extends { [k: string]: V }>(obj: T) =>
                   <K extends keyof T>(k: string): V | null => {
  try {
    return obj[k];
  } catch(e) {
    return null;
  }
}

// map object, from Ramda without the `map` dispatch
const mapObject = (fn: Function) =>
                  (obj: { [k: string]: any }) =>
  R.reduce((acc: { [k: string]: any }, key: string) => {
    acc[key] = fn(obj[key]);
    return acc;
  }, {}, R.keys(obj));

// get functions of a class / prototype
// { [k: string]: Function }
export const getFunctions = <T extends {}>(obj: T): {} => R.pipe(
  Object.getOwnPropertyNames,
  R.map((k: string) => [k, k]),
  R.fromPairs,
  R.filter(R.pipe(safeAccess(obj), R.is(Function))),
  R.map(safeAccess(obj)),
)(obj);

// curry functions
export const flipStatic = <T>(cls: Type<T>) => R.pipe(
  getFunctions,
  mapObject((f: Function) => (...rest: any[]) => (x: any) => f(x, ...rest)),
        // ^ variadic R.partialRight, this allows further currying if desired
)(cls);

// curry methods
export const flipPrototype = <T>(cls: Type<T>) => R.pipe(
  getFunctions,
  mapObject((f: Function) => (...rest: any[]) => (x: T) => f.apply(x, rest)),
)(cls.prototype);

// return curried functions -- subject last for prototype methods (all arities)
export const flipClass = <T>(cls: Type<T>) => R.merge(
  flipPrototype(cls),
  flipStatic(cls),
);

export default flipClass;

// code for curried versions:

// addArities enum
export const [DYNAMIC, FIXED_EXACT, EVEN_OPTIONAL] = R.range(0, 10);
// limitation of R._arity used in R.curry
const maxArity = (isProto = false) => 9 - (isProto ? 1 : 0);

// get arities of a class / prototype
export const getArities = (isProto = false) => <T extends { [k: string]: Function }>(obj: T) => R.pipe(
  Object.getOwnPropertyNames,
  R.filter(R.pipe(safeAccess(obj), R.is(Function))),
  R.map(R.pipe(
    safeAccess(obj),
    <F extends Function>(f: F) => [f.name, [R.clamp(0, maxArity(isProto), f.length), f.name]],
  )),
  R.fromPairs,
)(obj);

// add versions for different arities
const withLower = (isProto = false) => (n: number, k: string) => R.pipe(
  R.flip(R.range)(1 + maxArity(isProto)),
  R.map((i: number) => [`${k}${ i + (isProto ? 1 : 0) }`, [i, k]]),
  R.concat([[k, [n, k]]]),
  R.fromPairs,
)(n);

// instead of just e.g. `indexOf` (arity 3), also get lower arities, e.g. `indexOf`, `indexOf3`, `indexOf2`, `indexOf1`
const getUsedArities = (isProto: boolean, addArities: number) =>
    addArities == EVEN_OPTIONAL ?
        R.pipe(R.map(R.apply(withLower(isProto))), R.values, R.mergeAll) :
        R.identity;

const dynamify = (isProto: boolean, addArities: number, fn: <T, F extends Function>(n: number, x: T) => F) => addArities == DYNAMIC ?
    R.pipe(R.nthArg(1), R.flip(fn), <F extends Function>(f: F) => (i: number) => f(i - (isProto ? 1 : 0))) :
    fn;

export const curryStatic = <T>(cls: Type<T>, addArities = EVEN_OPTIONAL) => R.pipe(
  getArities(false),
  getUsedArities(false, addArities),
  R.map(R.pipe(
    R.tap(console.log.bind(console)),
    R.adjust((k: keyof Type<T>) => (...args: any[]) => cls[k](R.last(args), ...R.dropLast(1, args)), 1),
    R.apply(dynamify(false, addArities, R.curryN)),
  )),
)(cls);

export const curryPrototype = <T>(cls: Type<T>, addArities = EVEN_OPTIONAL) => R.pipe(
  getArities(true),
  getUsedArities(true , addArities),
  R.map(R.apply(dynamify(true, addArities, R.invoker))),
)(cls.prototype);

// return curried functions -- subject last for prototype methods (all arities)
export const curryClass = <T>(cls: Type<T>, addArities = EVEN_OPTIONAL) => R.merge(
  curryPrototype(cls, addArities),
  curryStatic(cls, addArities),
);

// return curried functions, arities must be explicitly passed
export const curryNClass = <T>(cls: Type<T>) => curryClass(cls, DYNAMIC);
