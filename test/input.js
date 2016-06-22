/*

test.js - test script

The MIT License (MIT)

Copyright (c) 2015 Dale Schumacher

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

var tart = require('tart-tracing');
var input = require('../input.js');

//var log = console.log;
var log = function () {};

var test = module.exports = {};

test['empty string returns end marker'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var cust = sponsor(function (r) {
        test.equal(0, r.pos);
        test.strictEqual(undefined, r.token);
    });

    var stream = sponsor(input.stringStream(''));
    stream(cust);

    test.ok(tracing.eventLoop({
/*
        log: function (effect) {
            console.log('DEBUG', effect);
        },
*/
        fail: function (e) {
            console.log('ERROR!', e);
        }
    }));
    test.done();
};

var multilineFixture = function multilineFixture(test, sponsor) {
    var fixture = {
        expect: 17,
        source: '\r\n\n\r'
    };
    var c0 = fixture.c0 = sponsor(function (r) {
        log('c0:', r);
        test.equal(0, r.pos);
        test.equal('\r', r.value);
        test.equal(0, r.row);
        test.equal(0, r.col);
        r.next(c1);
    });
    var c1 = fixture.c1 = sponsor(function (r) {
        log('c1:', r);
        test.equal(1, r.pos);
        test.equal('\n', r.value);
        test.equal(0, r.row);
        test.equal(1, r.col);
        r.next(c2);
    });
    var c2 = fixture.c2 = sponsor(function (r) {
        log('c2:', r);
        test.equal(2, r.pos);
        test.equal('\n', r.value);
        test.equal(1, r.row);
        test.equal(0, r.col);
        r.next(c3);
    });
    var c3 = fixture.c3 = sponsor(function (r) {
        log('c3:', r);
        test.equal(3, r.pos);
        test.equal('\r', r.value);
        test.equal(2, r.row);
        test.equal(0, r.col);
        r.next(c4);
    });
    var c4 = fixture.c4 = sponsor(function (r) {
        log('c4:', r);
        // test.equal(4, r.pos);
        test.strictEqual(undefined, r.value);
        // test.equal(3, r.row);
        // test.equal(0, r.col);
    });
    return fixture;
};
test['string stream counts lines'] = function (test) {
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var fixture = multilineFixture(test, sponsor);
    test.expect(fixture.expect + 1);

    var stream = sponsor(input.stringStream(fixture.source));
    stream(fixture.c0);

    test.ok(tracing.eventLoop());
    test.done();
};

test['empty array returns end marker'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var cust = sponsor(function (r) {
        test.equal(0, r.pos);
        test.strictEqual(undefined, r.token);
    });

    var stream = sponsor(input.arrayStream([]));
    stream(cust);

    test.ok(tracing.eventLoop());
    test.done();
};

var arrayFixture = function arrayFixture(test, sponsor) {
    var fixture = {
        expect: 9,
        source: [
            42,
            'foo',
            {}
        ]
    };
    var c0 = fixture.c0 = sponsor(function (r) {
        log('c0:', r);
        test.equal(0, r.pos);
        test.strictEqual(42, r.token);
        r.next(c1);
    });
    var c1 = fixture.c1 = sponsor(function (r) {
        log('c1:', r);
        test.equal(1, r.pos);
        test.strictEqual('foo', r.token);
        r.next(c2);
    });
    var c2 = fixture.c2 = sponsor(function (r) {
        log('c2:', r);
        test.equal(2, r.pos);
        test.strictEqual('object', typeof r.token);
        r.next(c3);
    });
    var c3 = fixture.c3 = sponsor(function (r) {
        log('c3:', r);
        test.equal(3, r.pos);
        test.strictEqual(undefined, r.token);
    });
    return fixture;
};
test['array stream handles many types'] = function (test) {
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var fixture = arrayFixture(test, sponsor);
    test.expect(fixture.expect);

    var stream = sponsor(input.arrayStream(fixture.source));
    stream(fixture.c0);

    test.ok(tracing.eventLoop());
    test.done();
};

test['actor-based stream from readable'] = function (test) {
    test.expect(8);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var s = require('../stream.js');
    var ws = s.characters();
    var rs = ws; //ws.pipe(s.countRowCol());
    var next = input.fromReadable(sponsor, rs);
    var ar = ['.', '\r', '\r', '\n', '\n', '!'];
    var match = sponsor(function matchBeh(m) {
        var first = ar.shift();  // consume first expected result value
        log('matchBeh'+this.self+':', m, JSON.stringify(first));
        test.equal(first, m.value);
        if (first !== undefined) {
            m.next(this.self);
        }
    });
    ws.end('.\r\r\n\n!');
    next(match);  // start reading the actor-based stream

/*
    test.ok(tracing.eventLoop());
*/
    test.ok(tracing.eventLoop({
        count: 100,
//        log: function (effect) { console.log('DEBUG', effect); },
        fail: function (exception) { console.log('FAIL!', exception); }
    }));
    log('test:', 'eventLoop() completed.');
    test.done();
};

test['string helper counts lines'] = function (test) {
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var fixture = multilineFixture(test, sponsor);
    test.expect(fixture.expect + 1);

    var stream = input.fromString(sponsor, fixture.source);
    stream(fixture.c0);

    require('../fixture.js').asyncRepeat(3,
        function action() {
            return tracing.eventLoop({
                count: 100,
//                log: function (effect) { console.log('DEBUG', effect); },
              fail: function (error) { console.log('FAIL!', error); }
            });
        },
        function callback(error, result) {
            test.ok(!error && result);
            test.done();
        }
    );
};

test['array helper handles many types'] = function (test) {
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var fixture = arrayFixture(test, sponsor);
    test.expect(fixture.expect);

    var stream = input.fromArray(sponsor, fixture.source);
    stream(fixture.c0);

    require('../fixture.js').asyncRepeat(3,
        function action() {
            return tracing.eventLoop({
                count: 100,
//                log: function (effect) { console.log('DEBUG', effect); },
              fail: function (error) { console.log('FAIL!', error); }
            });
        },
        function callback(error, result) {
            test.ok(!error && result);
            test.done();
        }
    );
};
