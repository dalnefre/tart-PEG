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

function Y(a, b) {  // binary tree with left branch `a` and right branch `b`
    this.a = a;
    this.b = b;
}
// Y.prototype.toString = function toString() { return '<' + this.a + ', ' + this.b + '>' };
var aTree = new Y(1, new Y(new Y(2, 3), 4));  // <1, <<2, 3>, 4>>
var bTree = new Y(new Y(1, 2), new Y(3, 4));  // <<1, 2>, <3, 4>>
var cTree = new Y(new Y(new Y(1, 2), 3), new Y(5, 8));  // <<<1, 2>, 3>, <5, 8>>

test['<1, <<2, 3>, 4>> has fringe [1, 2, 3, 4]'] = function (test) {
    test.expect(1);

    var fringe = function fringe(tree) {
        if (tree instanceof Y) {
            let left = fringe(tree.a);
            let right = fringe(tree.b);
            return left.concat(right);
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

test['suspend calculations in generators'] = function (test) {
    test.expect(1);

    var genFringe = function* genFringe(tree) {
        if (tree instanceof Y) {
            yield* genFringe(tree.a);
            yield* genFringe(tree.b);
        } else {
            yield tree;
        }
    };

    var fringe = [];
    var gen = genFringe(aTree);
    var leaf = gen.next();
    while (leaf.value !== undefined) {
        fringe.push(leaf.value);
        leaf = gen.next();
    };
    test.deepEqual(fringe, [ 1, 2, 3, 4 ]);

    test.done();
};

test['suspend calculations in closures'] = function (test) {
    test.expect(1);

    var genFringe = function genFringe(tree, next) {
        next = next || (() => ({}));  // default next == end
        if (tree instanceof Y) {
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
    var leaf = (genFringe(aTree))();
    while (leaf.value !== undefined) {
        fringe.push(leaf.value);
        leaf = leaf.next();
    };
    test.deepEqual(fringe, [ 1, 2, 3, 4 ]);

    test.done();
};

test['incrementally compare functional fringe'] = function (test) {
    test.expect(5);

    var genFringe = function genFringe(tree, next) {
        next = next || (() => ({}));  // default next == end
        if (tree instanceof Y) {
            return () => (genFringe(tree.a, genFringe(tree.b, next)))();
        } else {
            return () => ({ value: tree, next: next });
        }
    };

    var r0 = (genFringe(aTree))();
    var r1 = (genFringe(bTree))();
    while (true) {
        test.strictEqual(r0.value, r1.value);  // match stream contents
        if ((r0.value === undefined) || (r1.value === undefined)) {
            break;  // stream end
        }
        r0 = r0.next();
        r1 = r1.next();
    };

    test.done();
};

test['compare functional fringe to infinite series'] = function (test) {
    test.expect(6);

    var genFringe = function genFringe(tree, next) {
        next = next || (() => ({}));  // default next == end
        if (tree instanceof Y) {
            return () => (genFringe(tree.a, genFringe(tree.b, next)))();
        } else {
            return () => ({ value: tree, next: next });
        }
    };
    var genSeries = function genSeries(value, update) {
        return () => ({ value: value, next: genSeries(update(value), update) });
    };

    var r0 = (genFringe(aTree))();
    var r1 = (genSeries(1, n => n + 1))();
    while ((r0.value !== undefined) && (r1.value !== undefined)) {
        test.strictEqual(r0.value, r1.value);  // match stream contents
        r0 = r0.next();
        r1 = r1.next();
    };
    test.strictEqual(r0.value, undefined);  // fringe stream ended
    test.strictEqual(r1.value, 5);  // un-matched series value should be 5

    test.done();
};

test['compare generator fringe to infinite series'] = function (test) {
    test.expect(6);

    var genFringe = function* genFringe(tree) {
        if (tree instanceof Y) {
            yield* genFringe(tree.a);
            yield* genFringe(tree.b);
        } else {
            yield tree;
        }
    };
    var genSeries = function* genSeries(value, update) {
        while (true) {
            yield value;
            value = update(value);
        }
    };

    var gen0 = genFringe(aTree);
    var r0 = gen0.next();
    var gen1 = genSeries(1, n => n + 1);
    var r1 = gen1.next();
    while ((r0.value !== undefined) && (r1.value !== undefined)) {
        test.strictEqual(r0.value, r1.value);  // match stream contents
        r0 = gen0.next();
        r1 = gen1.next();
    };
    test.strictEqual(r0.value, undefined);  // fringe stream ended
    test.strictEqual(r1.value, 5);  // un-matched series value should be 5

    test.done();
};

test['compare generator fringe to infinite series using for..of'] = function (test) {
    test.expect(6);

    var genFringe = function* genFringe(tree) {
        if (tree instanceof Y) {
            yield* genFringe(tree.a);
            yield* genFringe(tree.b);
        } else {
            yield tree;
        }
    };
    var genSeries = function* genSeries(value, update) {
        while (true) {
            yield value;
            value = update(value);
        }
    };
    var zip = function* zip(first, second) {
        while (true) {
            let f = first.next();
            let s = second.next();
            if (f.done || s.done)
            {
                return;
            }
            yield [f.value, s.value];
        }
    }

    let pair;
    for (pair of zip(genFringe(aTree), genSeries(1, n => n + 1)))
    {
        test.strictEqual(pair[0], pair[1]);
    }

    test.strictEqual(pair[0], 4);  // finished at last fringe stream value
    test.strictEqual(pair[1], 4);  // finished at last series value

    test.done();
};

test['functional fringe comparisons'] = function (test) {
    test.expect(6);

    var genFringe = function genFringe(tree, next) {
        next = next || (() => ({}));  // default next == end
        if (tree instanceof Y) {
            return () => (genFringe(tree.a, genFringe(tree.b, next)))();
        } else {
            return () => ({ value: tree, next: next });
        }
    };
    var sameFringe = function sameFringe(s0, s1) {
        let r0 = s0();  // get result from first sequence
        let r1 = s1();  // get result from second sequence
        while (r0.value === r1.value) {
            if (r0.value === undefined) {
                return true;   // stream end
            }
            r0 = r0.next();
            r1 = r1.next();
        }
        return false;  // mismatch
    };

    test.strictEqual(sameFringe(genFringe(aTree), genFringe(bTree)), true);
    test.strictEqual(sameFringe(genFringe(cTree), genFringe(bTree)), false);

    var genSeries = function genSeries(value, update) {
        return () => {
            try {
                let next = genSeries(update(value), update);
                return { value: value, next: next };
            } catch (e) {
                return { error: e };
            }
        };
    };
    test.strictEqual(sameFringe(genFringe(cTree), genSeries(1, n => n + 1)), false);

    var genRange = function genRange(lo, hi) {
        if (lo < hi) {
            return () => ({ value: lo, next: genRange(lo + 1, hi) });
        } else {
            return () => ({});  // stream end
        }
    };
    test.strictEqual(sameFringe(genRange(0, 32), genRange(0, 32)), true);
    test.strictEqual(sameFringe(genRange(0, 99999), genRange(0, 99999)), true);
    test.strictEqual(sameFringe(genRange(42, 123456), genSeries(42, n => n + 1)), false);

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

    var mkFringe = function mkFringe(tree, next) {
        return function fringeBeh(cust) {
            next = next || this.sponsor(function (cust) { cust({}); });
            if (tree instanceof Y) {
                var right = this.sponsor(mkFringe(tree.b, next));
                var left = this.sponsor(mkFringe(tree.a, right));
                left(cust);
            } else {
                cust({ value: tree, next: next });
            }
        };
    };
    var collector = function collector(fringe) {
        return function collectBeh(leaf) {  // leaf = { value:, next: } | {}
            log('leaf:', leaf);
            if (leaf.value) {
                this.behavior = collector(fringe.concat([ leaf.value ]));
                leaf.next(this.self);
            } else {
                test.deepEqual(fringe, [ 1, 2, 3, 4 ]);
                test.done();
            }
        };
    };

    var stream = sponsor(mkFringe(aTree));
    var reader = sponsor(collector([]));
    stream(reader);
};

test['stateful actor-based fringe stream'] = function (test) {
    test.expect(1);
    var sponsor = tart(warn);  // actor create capability

    var mkFringe = function mkFringe(tree, next) {
        return function fringeBeh(cust) {
            next = next || this.sponsor(function (cust) { cust({}); });
            if (tree instanceof Y) {
                this.behavior = mkFringe(tree.b, next);
                var left = this.sponsor(mkFringe(tree.a, this.self));
                left(cust);
            } else {
                cust({ value: tree, next: next });
            }
        };
    };
    var collector = function collector(fringe) {
        return function collectBeh(leaf) {  // leaf = { value:, next: } | {}
            log('leaf:', leaf);
            if (leaf.value) {
                this.behavior = collector(fringe.concat([ leaf.value ]));
                leaf.next(this.self);
            } else {
                test.deepEqual(fringe, [ 1, 2, 3, 4 ]);
                test.done();
            }
        };
    };

    var stream = sponsor(mkFringe(aTree));
    var reader = sponsor(collector([]));
    stream(reader);
};

test['incrementally compare actor-based streams'] = function (test) {
    test.expect(5);
    var sponsor = tart(warn);  // actor create capability

    var mkFringe = function mkFringe(tree, next) {
        return function fringeBeh(cust) {
            next = next || this.sponsor(function (cust) { cust({}); });
            if (tree instanceof Y) {
                this.behavior = mkFringe(tree.b, next);
                var left = this.sponsor(mkFringe(tree.a, this.self));
                left(cust);
            } else {
                cust({ value: tree, next: next });
            }
        };
    };
    var comparator = function comparator(cust) {
        var initBeh = function compareBeh(r0) {  // r0 = { value:, next: } | {}
            this.behavior = function compareBeh(r1) {  // r1 = { value:, next: } | {}
                this.behavior = initBeh;
                log('r0:', r0, 'r1:', r1);
                if (r0.value === r1.value) {
                    if (r0.value === undefined) {
                        cust(true);  // stream end
                    } else {
                        test.strictEqual(r0.value, r1.value);  // match stream contents
                        r0.next(this.self);
                        r1.next(this.self);
                    }
                } else {
                    cust(false);  // mismatch
                }
            };
        };
        return initBeh;
    };

    var finish = sponsor(function finishBeh(matched) {
        test.ok(matched);
        test.done();
    });
    var s0 = sponsor(mkFringe(aTree));
    var s1 = sponsor(mkFringe(bTree));
    var compare = sponsor(comparator(finish));
    s0(compare);
    s1(compare);
};

test['stream comparison stops early on mismatch'] = function (test) {
    test.expect(5);
    var sponsor = tart(warn);  // actor create capability

    var mkFringe = function mkFringe(tree, next) {
        return function fringeBeh(cust) {
            next = next || this.sponsor(function (cust) { cust({}); });
            if (tree instanceof Y) {
                this.behavior = mkFringe(tree.b, next);
                var left = this.sponsor(mkFringe(tree.a, this.self));
                left(cust);
            } else {
                cust({ value: tree, next: next });
            }
        };
    };
    var comparator = function comparator(cust) {
        var initBeh = function compareBeh(r0) {  // r0 = { value:, next: } | {}
            this.behavior = function compareBeh(r1) {  // r1 = { value:, next: } | {}
                this.behavior = initBeh;
                log('r0:', r0, 'r1:', r1);
                if (r0.value === r1.value) {
                    if (r0.value === undefined) {
                        cust(true);  // stream end
                    } else {
                        test.strictEqual(r0.value, r1.value);  // match stream contents
                        r0.next(this.self);
                        r1.next(this.self);
                    }
                } else {
//                    cust(false);  // mismatch
                    cust(r1);  // send mismatch to finish
                }
            };
        };
        return initBeh;
    };

    var finish = sponsor(function finishBeh(matched) {
        log('matched:', matched);
        test.strictEqual('object', typeof matched);
        test.strictEqual(5, matched.value);
        test.done();
    });
    var s0 = sponsor(mkFringe(aTree));
    var s1 = sponsor(mkFringe(cTree));
    var compare = sponsor(comparator(finish));
    s0(compare);
    s1(compare);
};

test['compare actor fringe to infinite series'] = function (test) {
    test.expect(6);
    var sponsor = tart(warn);  // actor create capability

    var mkFringe = function mkFringe(tree, next) {
        return function fringeBeh(cust) {
            next = next || this.sponsor(function (cust) { cust({}); });
            if (tree instanceof Y) {
                this.behavior = mkFringe(tree.b, next);
                var left = this.sponsor(mkFringe(tree.a, this.self));
                left(cust);
            } else {
                cust({ value: tree, next: next });
            }
        };
    };
    var mkSeries = function mkSeries(value, update) {
        return function seriesBeh(cust) {
            var next = this.sponsor(mkSeries(update(value), update));
            cust({ value: value, next: next });
        }
    };
    var comparator = function comparator(cust) {
        var initBeh = function compareBeh(r0) {  // r0 = { value:, next: } | {}
            this.behavior = function compareBeh(r1) {  // r1 = { value:, next: } | {}
                this.behavior = initBeh;
                log('r0:', r0, 'r1:', r1);
                if (r0.value === r1.value) {
                    if (r0.value === undefined) {
                        cust(true);  // stream end
                    } else {
                        test.strictEqual(r0.value, r1.value);  // match stream contents
                        r0.next(this.self);
                        r1.next(this.self);
                    }
                } else {
//                    cust(false);  // mismatch
                    cust(r0);  // send mismatch to finish
                }
            };
        };
        return initBeh;
    };

    var finish = sponsor(function finishBeh(matched) {
        log('matched:', matched);
        test.strictEqual('object', typeof matched);
        test.strictEqual(5, matched.value);
        test.done();
    });
    var s0 = sponsor(mkFringe(aTree));
    var s1 = sponsor(mkSeries(1, (n => n + 1)));
    var compare = sponsor(comparator(finish));
    s0(compare);
    s1(compare);
};
