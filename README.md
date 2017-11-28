# Pointfree

> It's [that](https://github.com/ramda/ramda/issues/1367#issuecomment-279887477) easy to make a pointfree version of ImmutableJS? could we do that for other libs, or even the [standard library](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects)?

## Usage:

### flipClass

```js
const { flipClass } = require('pointfree');

// flipClass yields variadic functions with the main argument last (separately)
var P = R.map(flipClass)({ String, Number });

// pointfree method, with method-calling object as the last argument:
P.String.replace(/o+/g, 'b')('foo') // 'fb'
// pointfree function, first argument provided separately last:
P.String.includes('f', 2)('food') // false
// optional arguments still work, using default values if not supplied:
P.String.includes('f')('food') // true

// built-in? libraries? any should work!
var P = R.map(flipClass)({ Array, Object, Promise, Set, Observable });

// heck, why not pick out some you like?
let { then } = P.Promise;
let thenThisThenThat = R.pipe(then(fnA), then(fnB, catcher));
```

### curryClass

```js
const { curryClass } = require('pointfree');

// curryClass generates curried function versions of JS functions/methods
var P = R.map(curryClass)({ String, Number });

// curried method, with method-calling object as the last argument:
P.String.replace(/o+/g)('b')('foo') // 'fb'
// curried function, first argument provided last:
let leet = P.Number.parseInt('539', 16);

// optional arguments always use default values:
P.String.includes('f')('food') // true -- optional `position`: default 0
P.String.includes('f')(2)('food') // fails, arity is 2
// explicit-arity variants enable optional arguments:
P.String.includes3('f')(2)('food') // works, false

var P = R.map(curryClass)({ Array, Object, Promise, Set, Observable });
let { then, then2 } = P.Promise;
let thenThisThenThat = R.pipe(then(fnA), then2(fnB, catcher));
```

### curryNClass

```js
const { curryNClass } = require('pointfree');

// curryClass generates curried versions with explicit arities
var P = R.map(curryNClass)({ String, Number });
P.String.includes(3)('f', 2, 'food'); // arity: 3
P.String.includes(3)('f')(2)('food'); // rest still curried, of course
```

### Using on libraries, standard library

```js
// manually picking classes too much effort? why not grab all in `window`?
const classes = R.pipe(
  Object.getOwnPropertyNames,
  R.map(k => [k, window[k]]),
  R.fromPairs,
  R.filter(c => c && c.prototype),
)(window);

// curried Array methods? check. Date? sure. Map or Promise? yep, unless you're on IE5.
var P = R.map(flipClass)(classes);

// ImmutableJS
let Immutable = require('immutable');
let { Map: IMap, Set: ISet } = Immutable;
var P = R.map(flipClass)({ IMap, ISet });

// curryClass: ditto
```

## Context:

> But... I could just write `p=>p.then(f)`!

Yeah. Common functions can be taken out though, like `then` above.
Method notation may also get a bit more verbose with TypeScript/Flow typings,
though type inference is still tough here as well.
