import * as R from 'ramda';
import { flipClass, curryClass, curryNClass } from '.';

// flipClass
(() => {
    let P = R.map(flipClass)({ String, Number });
    // pointfree method, with method-calling object as the last argument:
    let fb = P.String.replace(/o+/g, 'b')('foo'); // 'fb'
    console.log(fb);
    // pointfree function, first argument provided separately last:
    let leet = P.Number.parseInt(16)('539'); // 1337
    console.log(leet);
})();

// curryClass
(() => {
    let P = R.map(curryClass)({ String, Number });
    // curried method, with method-calling object as the last argument:
    let fb = P.String.replace(/o+/g)('b')('foo'); // 'fb'
    console.log(fb);
    // curried function with explicit arity, first argument provided last:
    let leet = P.Number.parseInt2(16, '539'); // 1337
    console.log(leet);
})();

// curryNClass
(() => {
    let P = R.map(curryNClass)({ String, Number });
    // curried method, with method-calling object as the last argument:
    let fb = P.String.replace(/o+/g)('b')('foo');
    console.log(fb);
    // curried function, first argument provided last:
    let leet = P.Number.parseInt('539', 16);
    console.log(leet);
})();
