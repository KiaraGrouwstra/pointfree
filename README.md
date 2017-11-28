# Pointfree

> It's [that](https://github.com/ramda/ramda/issues/1367#issuecomment-279887477) easy to make a pointfree version of ImmutableJS? could we do that for other libs, or even the [standard library](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects)?

## Usage:

```js
const pointfree = require('pointfree');

// generates curried function versions of JS functions/methods
var P = R.map(pointfree)({ String, Number });

// pointfree method, with method-calling object as the last argument:
P.String.replace(/o+/g, 'b')('foo') // 'fb'
// pointfree function, first argument provided separately last:
P.String.includes('f', 2)('food') // false
// optional arguments still work, using default values if not supplied:
P.String.includes('f')('food') // true

// built-in? libraries? all can be curried!
var P = R.map(pointfree)({ Array, Object, Promise, Set, Observable });

// heck, why not pick out some you like?
let { then } = P.Promise;
let thenThisThenThat = R.pipe(then(fnA), then(fnB, catcher));

// manually picking classes too much effort? why not grab all in `window`?
const classes = R.pipe(
  Object.getOwnPropertyNames,
  R.map(k => [k, window[k]]),
  R.fromPairs,
  R.filter(c => c && c.prototype),
)(window);

// curried Array methods? check. Date? sure. Map or Promise? yep, unless you're on IE5.
var P = R.map(pointfree)(classes);

// ImmutableJS
let Immutable = require('immutable');
let { Map: IMap, Set: ISet } = Immutable;
var P = R.map(pointfree)({ IMap, ISet });
```

## Context:

> But... I could just write `p=>p.then(f)`!

Yeah. Common functions can be taken out though, like `then` above.
Method notation may also get a bit more verbose with TypeScript/Flow typings,
though type inference is still tough here as well.
