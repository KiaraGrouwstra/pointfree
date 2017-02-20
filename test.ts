import * as R from 'ramda';
import pointfree from './index';

// generates curried function versions of JS functions/methods
var P = R.map(pointfree)({ String, Number });

// curried method, with method-calling object as the last argument:
let fb = P.String.replace(/o+/g)('b')('foo');
console.log(fb);
// curried function, argument order intact:
let leet = P.Number.parseInt('539')(16);
console.log(leet);
