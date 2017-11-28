import * as R from 'ramda';
import pointfree from '.';

// generates curried function versions of JS functions/methods
var P = R.map(pointfree)({ String, Number });

// pointfree method, with method-calling object as the last argument:
let fb = P.String.replace(/o+/g, 'b')('foo') // 'fb'
console.log(fb);
// pointfree function, first argument provided separately last:
let leet = P.Number.parseInt(16)('539') // 1337
console.log(leet);
