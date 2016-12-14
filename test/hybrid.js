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
var bTree = new Y(new Y(1, 2), new Y(3, 4));  // <<1, 2>, <3, 4>>
var cTree = new Y(new Y(new Y(1, 2), 3), new Y(5, 8));  // <<<1, 2>, 3>, <5, 8>>

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
    
    test.deepEqual(fringe(aTree), fringe(bTree));

    test.done();
};

test['suspend calculations in closures'] = function (test) {
    test.expect(1);
    
    var genFringe = function genFringe(tree, next) {
        if (tree instanceof Y) {
//            return () => (genFringe(tree.a, genFringe(tree.b, next)))();
            return () => {
                var right = genFringe(tree.b, next);
                var left = genFringe(tree.a, right);
                return left();
            }
        } else {
            return () => ({ value: tree, next: next });
        }
    };

    var fringe = [];
    var next = genFringe(aTree, null);
    while (next) {
        var leaf = next();
        fringe.push(leaf.value);
        next = leaf.next;
    };
    test.deepEqual(fringe, [ 1, 2, 3, 4 ]);

    test.done();
};

test['incrementally compare functional fringe'] = function (test) {
    test.expect(5);
    
    var genFringe = function genFringe(tree, next) {
        if (tree instanceof Y) {
            return () => (genFringe(tree.a, genFringe(tree.b, next)))();
        } else {
            return () => ({ value: tree, next: next });
        }
    };
    
    var s0 = genFringe(aTree, null);
    var s1 = genFringe(bTree, null);
    while (s0 && s1) {
        var i0 = s0();
        var i1 = s1();
        test.strictEqual(i0.value, i1.value);  // match stream contents
        s0 = i0.next;
        s1 = i1.next;
    };
    test.strictEqual(s0, s1);  // make sure both streams ended (null === null)

    test.done();
};

test['compare functional fringe to infinite series'] = function (test) {
    test.expect(6);
    
    var genFringe = function genFringe(tree, next) {
        if (tree instanceof Y) {
            return () => (genFringe(tree.a, genFringe(tree.b, next)))();
        } else {
            return () => ({ value: tree, next: next });
        }
    };
    var genSeries = function genSeries(value, update) {
        return () => ({ value: value, next: genSeries(update(value), update) });
    };
    
    var s0 = genFringe(aTree, null);
    var s1 = genSeries(1, (n => n + 1));
    while (s0 && s1) {
        var i0 = s0();
        var i1 = s1();
        test.strictEqual(i0.value, i1.value);  // match stream contents
        s0 = i0.next;
        s1 = i1.next;
    };
    test.strictEqual(s0, null);  // fringe stream ended
    test.strictEqual(s1().value, 5);  // first un-matched value should be 5

    test.done();
};

var tart = (f)=>{let c=(b)=>{let a=(m)=>{setImmediate(()=>{try{x.behavior(m)}catch(e){f&&f(e)}})},x={self:a,behavior:b,sponsor:c};return a};return c};
/*
var tart = (f) => {
    let c = (b) => {
        let a = (m) => {
            setImmediate(() => {
                try {
                    x.behavior(m)
                } catch(e) {
                    f && f(e)
                }
            })
        }, x = {
            self: a,
            behavior: b,
            sponsor: c
        };
        return a
    };
    return c
};
var tart = function(){var c=function(b){var a=function(m){setImmediate(function(){x.behavior(m)})},x={self:a,behavior:b,sponsor:c};return a};return c}
var tart = function () {
    var c = function (b) {
        var a = function (m) {
            setImmediate(function () {
                x.behavior(m)
            })
        }, x = {
            self: a,
            behavior: b,
            sponsor: c
        };
        return a
    };
    return c
}
*/

test['stateless actor-based fringe stream'] = function (test) {
    test.expect(1);
    var sponsor = tart(warn);  // actor create capability
    
    var genFringe = function genFringe(tree, next) {
        if (tree instanceof Y) {
            return function treeBeh(cust) {
                var right = this.sponsor(genFringe(tree.b, next));
                var left = this.sponsor(genFringe(tree.a, right));
                left(cust);
            };
        } else {
            return function leafBeh(cust) {
                cust({ value: tree, next: next });
            };
        }
    };
    var collector = function collector(fringe) {
        return function collectBeh(leaf) {  // leaf = { value:, next: } | null
            log('leaf:', leaf);
            if (leaf) {
                this.behavior = collector(fringe.concat([ leaf.value ]));
                leaf.next(this.self);
            } else {
                test.deepEqual(fringe, [ 1, 2, 3, 4 ]);
                test.done();
            }
        };
    };
    
    var end = sponsor(function (cust) { cust(null); });
    var stream = sponsor(genFringe(aTree, end));
    var reader = sponsor(collector([]));
    stream(reader);
};

test['stateful actor-based fringe stream'] = function (test) {
    test.expect(1);
    var sponsor = tart(warn);  // actor create capability
    
    /*
    LET fringe_gen_beh(tree, next) = \cust.[
        IF $tree = (left, right) [
            SEND cust TO NEW fringe_gen_beh(left, SELF)
            BECOME fringe_gen_beh(right, next)
        ] ELSE [
            SEND (tree, next) TO cust
        ]
    ]
    */
    var genFringe = function genFringe(tree, next) {
        if (tree instanceof Y) {
            return function treeBeh(cust) {
                this.behavior = genFringe(tree.b, next);
                var left = this.sponsor(genFringe(tree.a, this.self));
                left(cust);
            };
        } else {
            return function leafBeh(cust) {
                cust({ value: tree, next: next });
            };
        }
    };
    var collector = function collector(fringe) {
        return function collectBeh(leaf) {  // leaf = { value:, next: } | null
            log('leaf:', leaf);
            if (leaf) {
                this.behavior = collector(fringe.concat([ leaf.value ]));
                leaf.next(this.self);
            } else {
                test.deepEqual(fringe, [ 1, 2, 3, 4 ]);
                test.done();
            }
        };
    };
    
    var end = sponsor(function (cust) { cust(null); });
    var stream = sponsor(genFringe(aTree, end));
    var reader = sponsor(collector([]));
    stream(reader);
};

test['incrementally compare actor-based streams'] = function (test) {
    test.expect(5);
    var sponsor = tart(warn);  // actor create capability
    
    var genFringe = function genFringe(tree, next) {
        if (tree instanceof Y) {
            return function treeBeh(cust) {
                this.behavior = genFringe(tree.b, next);
                var left = this.sponsor(genFringe(tree.a, this.self));
                left(cust);
            };
        } else {
            return function leafBeh(cust) {
                cust({ value: tree, next: next });
            };
        }
    };
    /*
    LET cmp_stream_beh(cust) = \(value, next).[
        BECOME \(value', next').[
            IF $value = $value' [
                BECOME cmp_stream_beh(cust)
                IF $next = $next' [
                    SEND TRUE TO cust
                ] ELIF $next = NIL [
                    SEND FALSE TO cust
                ] ELIF $next' = NIL [
                    SEND FALSE TO cust
                ] ELSE [
                    SEND SELF TO next
                    SEND SELF TO next'
                ]
            ] ELSE [
                SEND FALSE TO cust
            ]
        ]
    ]
    */
    var comparator = function comparator(cust) {
        var initBeh = function compareBeh(i0) {  // i0 = { value:, next: } | null
            this.behavior = function compareBeh(i1) {  // i1 = { value:, next: } | null
                this.behavior = initBeh;
                log('i0:', i0, 'i1:', i1);
                if (i0 === i1) {  // both streams ended
                    cust(true);
                } else if (i0 && i1) {  // get next leaves to compare
                    test.strictEqual(i0.value, i1.value);  // match stream contents
                    i0.next(this.self);
                    i1.next(this.self);
                } else {  // one stream ended early
                    cust(false);
                }
            };
        };
        return initBeh;
    };

    var finish = sponsor(function finishBeh(matched) {
        test.ok(matched);
        test.done();
    });
    var end = sponsor(function (cust) { cust(null); });
    var s0 = sponsor(genFringe(aTree, end));
    var s1 = sponsor(genFringe(bTree, end));
    var compare = sponsor(comparator(finish));
    s0(compare);
    s1(compare);
};

test['stream comparison stops early on mismatch'] = function (test) {
    test.expect(3);
    var sponsor = tart(warn);  // actor create capability
    
    var genFringe = function genFringe(tree, next) {
        if (tree instanceof Y) {
            return function treeBeh(cust) {
                this.behavior = genFringe(tree.b, next);
                var left = this.sponsor(genFringe(tree.a, this.self));
                left(cust);
            };
        } else {
            return function leafBeh(cust) {
                cust({ value: tree, next: next });
            };
        }
    };
    var comparator = function comparator(cust) {
        var initBeh = function compareBeh(i0) {  // i0 = { value:, next: } | null
            this.behavior = function compareBeh(i1) {  // i1 = { value:, next: } | null
                this.behavior = initBeh;
                log('i0:', i0, 'i1:', i1);
                if (i0 === i1) {  // both streams ended
                    cust(true);
                } else if (i0 && i1) {  // get next leaves to compare
                    if (i0.value === i1.value) {  // match stream contents
                        i0.next(this.self);
                        i1.next(this.self);
                    } else {
//                        cust(false);
                        i1.next(cust);  // should send 8 to finish
                    }
                } else {  // one stream ended early
                    cust(false);
                }
            };
        };
        return initBeh;
    };

    var finish = sponsor(function finishBeh(matched) {
        test.strictEqual('object', typeof matched);
        test.strictEqual(8, matched.value);
        test.strictEqual(end, matched.next);
        test.done();
    });
    var end = sponsor(function (cust) { cust(null); });
    var s0 = sponsor(genFringe(aTree, end));
    var s1 = sponsor(genFringe(cTree, end));
    var compare = sponsor(comparator(finish));
    s0(compare);
    s1(compare);
};

test['compare actor fringe to infinite series'] = function (test) {
    test.expect(2);
    var sponsor = tart(warn);  // actor create capability
    
    var genFringe = function genFringe(tree, next) {
        if (tree instanceof Y) {
            return function treeBeh(cust) {
                this.behavior = genFringe(tree.b, next);
                var left = this.sponsor(genFringe(tree.a, this.self));
                left(cust);
            };
        } else {
            return function leafBeh(cust) {
                cust({ value: tree, next: next });
            };
        }
    };
    var genSeries = function genSeries(value, update) {
        return function seriesBeh(cust) {
            var next = this.sponsor(genSeries(update(value), update));
            cust({ value: value, next: next });
        }
    };
    var comparator = function comparator(cust) {
        var initBeh = function compareBeh(i0) {  // i0 = { value:, next: } | null
            this.behavior = function compareBeh(i1) {  // i1 = { value:, next: } | null
                log('i0:', i0, 'i1:', i1);
                this.behavior = initBeh;
                if (i0 === i1) {  // both streams ended
                    cust(true);
                } else if (i0 && i1) {  // get next leaves to compare
                    if (i0.value === i1.value) {  // match stream contents
                        i0.next(this.self);
                        i1.next(this.self);
                    } else {
                        cust(false);
                    }
                } else {  // one stream ended early
//                    cust(false);
                    cust(i0 || i1);  // should send 5 to finish
                }
            };
        };
        return initBeh;
    };
    
    var finish = sponsor(function finishBeh(matched) {
        test.strictEqual('object', typeof matched);
        test.strictEqual(5, matched.value);
        test.done();
    });
    var end = sponsor(function (cust) { cust(null); });
    var s0 = sponsor(genFringe(aTree, end));
    var s1 = sponsor(genSeries(1, (n => n + 1)));
    var compare = sponsor(comparator(finish));
    s0(compare);
    s1(compare);
};
