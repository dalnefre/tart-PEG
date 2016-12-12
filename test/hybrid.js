/*

test.js - test script

The MIT License (MIT)

Copyright (c) 2016 Dale Schumacher

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";

var test = module.exports = {};

//var log = console.log;
var log = function () {};
var warn = console.log;

//var tart = require('tart-tracing');
var actor = require('../humus/hybrid.js');

test['actor model defines create and send'] = function (test) {
    test.expect(2);

    test.strictEqual(typeof actor.create, 'function');
    test.strictEqual(typeof actor.send, 'function');

    test.done();
};

var null_beh = function null_beh(msg) {  // no-op actor behavior
    return {
        actors: [],
        events: [],
        behavior: undefined
    };
};

test['behavior returns actors, events, and optional behavior'] = function (test) {
    test.expect(4);
    
    var m = 'Hello!';
    var r = null_beh(m);
    log('r:', r);
    
    test.strictEqual(typeof r, 'object');
    test.ok(Array.isArray(r.actors));
    test.ok(Array.isArray(r.events));
    test.ok((r.behavior === undefined) || ('function' === typeof r.behavior));

    test.done();
};

test['create returns actor address'] = function (test) {
    test.expect(1);
    
    var a = actor.create(null_beh);
    
    test.strictEqual(typeof a, 'function');  // address encoded as a function

    test.done();
};

test['send returns message-event'] = function (test) {
    test.expect(3);
    
    var a = actor.create(null_beh);
    var m = 'Hello!';
    var e = actor.send(a, m);
    
    test.strictEqual(typeof e, 'object');
    test.strictEqual(e.target, a);
    test.strictEqual(e.message, m);

    test.done();
};

test['one shot actor should forward first message, then ignore everything'] = function (test) {
    test.expect(4);
    
    var null_beh = function null_beh(msg) {
        log('null'+actor.self+':', msg);
        test.strictEqual(++count, 2);
        return {
            actors: [],
            events: [],
            behavior: undefined
        };
    };
    var one_shot = function one_shot(fwd) {
        return function one_shot_beh(msg) {
            log('one_shot'+actor.self+':', msg);
            test.strictEqual(++count, 1);
            return {
                actors: [],
                events: [
                    actor.send(fwd, msg)
                ],
                behavior: null_beh
            };
        };
    };
    var done_beh = function done_beh(msg) {
        log('done'+actor.self+':', msg);
        test.done();
        return {
            actors: [],
            events: [],
            behavior: undefined
        };
    };
    
    var count = 0;
    var a = actor.create(function end_beh(msg) {
        log('end'+actor.self+':', msg);
        test.strictEqual(++count, 3);
        var d = actor.create(done_beh);
        return {
            actors: [d],
            events: [
                actor.send(d, 'Z')
            ],
            behavior: undefined
        };
    });
    var b = actor.create(one_shot(a));
    actor.apply({
        actors: [a, b],
        events: [
            actor.send(b, 'X'),
            actor.send(b, 'Y')
        ]
    });
    test.strictEqual(actor.self, undefined);
};

var Y = function Y(a, b) {  // fork in a tree with `a` left branch and `b` right branch
    this.a = a;
    this.b = b;
};
// Y.prototype.toString = function toString() { return '<' + this.a + ', ' + this.b + '>' };
var aTree = new Y(1, new Y(new Y(2, 3), 4));  // <1, <<2, 3>, 4>>

test['<1, <<2, 3>, 4>> has fringe [1, 2, 3, 4]'] = function (test) {
    test.expect(1);
    
    var fringe = function fringe(tree) {
        if (tree instanceof Y) {
            return fringe(tree.a).concat(fringe(tree.b));
        }
        return [ tree ];
    };
    
    test.deepEqual(fringe(aTree), [ 1, 2, 3, 4 ]);

    test.done();
};

test['fringe(<1, <<2, 3>, 4>>) = fringe(<<1, 2>, <3, 4>>)'] = function (test) {
    test.expect(1);
    
    var fringe = function fringe(tree) {
        if (tree instanceof Y) {
            return fringe(tree.a).concat(fringe(tree.b));
        }
        return [ tree ];
    };
    
    var bTree = new Y(new Y(1, 2), new Y(3, 4));  // <<1, 2>, <3, 4>>
    test.deepEqual(fringe(aTree), fringe(bTree));

    test.done();
};

test['suspend calculations in closures'] = function (test) {
    test.expect(1);
    
    var nextFringe = function nextFringe(tree, next) {
        return function getLeaf() {
            if (tree instanceof Y) {
                next = nextFringe(tree.a, nextFringe(tree.b, next));
                return next();
            }
            return { value: tree, next: next };
        };
    };

    var fringe = [];
    var next = nextFringe(aTree);
    while (next) {
        var leaf = next();
        fringe.push(leaf.value);
        next = leaf.next;
    };
    test.deepEqual(fringe, [ 1, 2, 3, 4 ]);

    test.done();
};
