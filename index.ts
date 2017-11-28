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
export const curryStatic = <T>(cls: Type<T>) => R.pipe(
  getFunctions,
  mapObject((f: Function) => (...rest: any[]) => (x: any) => f(x, ...rest)),
        // ^ variadic R.partialRight, this allows further currying if desired
)(cls);

// curry methods
export const curryPrototype = <T>(cls: Type<T>) => R.pipe(
  getFunctions,
  mapObject((f: Function) => (...rest: any[]) => (x: T) => f.apply(x, rest)),
)(cls.prototype);

// return curried functions -- subject last for prototype methods (all arities)
const curryBoth = <T>(cls: Type<T>) => R.merge(
  curryPrototype(cls),
  curryStatic(cls),
);

export default curryBoth;
