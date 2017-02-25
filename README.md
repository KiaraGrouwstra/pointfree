# Pointfree

> Wait, it's [*that*](https://github.com/ramda/ramda/issues/1367#issuecomment-279887477) easy to make a pointfree curried version of ImmutableJS? If I could [read function lengths](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/length), could I repeat that for other libs like RxJS, or even the [entire standard library](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects)?

## Usage:

```js
const pointfree = require('pointfree');

// generates curried function versions of JS functions/methods
var P = R.map(pointfree)({ String, Number });

// curried method, with method-calling object as the last argument:
P.String.replace(/o+/g)('b')('foo') // 'fb'
// curried function, argument order intact:
P.Number.parseInt('539')(16) // 1337

// optional arguments always use default values:
P.String.includes('f')('food') // true -- optional `position`: default 0
P.String.includes('f')(2)('food') // fails, arity is 2
// explicit-arity variants enable optional arguments:
P.String.includes3('f')(2)('food') // works, false

// alternatively, force explicitly passing arities:
const DYNAMIC = 0;
var P = R.map(cls => pointfree(cls, DYNAMIC))({ String, Number });
P.String.includes(3)('f', 2, 'food'); // arity: 3
P.String.includes(3)('f')(2)('food'); // rest still curried, of course

// built-in? libraries? all can be curried!
var P = R.map(pointfree)({ Array, Object, Promise, Set, Observable });

// heck, why not just pick out some you like?
let { then, then2 } = P.Promise;

// look mom, pointfree without R.pipeP!
let thenThisThenThat = R.pipe(then(fnA), then2(fnB, catcher));

// manually picking classes too much effort? why not grab all in `window`?
const classes = R.pipe(
  Object.getOwnPropertyNames,
  R.map(k => [k, window[k]]),
  R.fromPairs,
  R.filter(c => c && c.prototype),
)(window);

// curried Array methods? check. Date? sure. Map or Promise? yep, unless you're on IE5.
var P = R.map(pointfree)(classes);

// ImmutableJS?
let Immutable = require('immutable');
var P = R.map(pointfree)({ Immutable.Map }); // boom, that's not a valid key...
let { Map: IMap, Set: ISet } = Immutable;
var P = R.map(pointfree)({ IMap, ISet }); // yay! free curry for everyone!
```

## Context:

> But... I could just write `p=>p.then(f)`!

Yeah. That get's a bit more verbose if you start using TypeScript/Flow typings though,
e.g. `<T>(p: Promise<T>) => p.then(f)`

At that point `P.Promise.then(f)` would... finally pay off a little.
I've yet to add typings though...

Until then, maybe this pays off a bit better using say `let { then } = P.Promise;` then `then(f)`.

## Todo:
- alias constructor as `new`?
- resolve TS errors
- ensure results are typed (haha, doesn't seem easy...)
- add a run-time check on methods to ensure the parameter is what it should be, as otherwise you could now be using methods on values of the wrong type!
