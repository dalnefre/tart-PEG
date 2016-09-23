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

var test = module.exports = {};

//var log = console.log;
var log = function () {};

var tart = require('tart-tracing');
var input = require('../input.js');

test['empty string returns end marker'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var cust = sponsor(function (r) {
        log('cust:', r);
        test.strictEqual(0, r.pos);
        test.strictEqual(undefined, r.token);
    });

    var stream = input.fromSequence(sponsor, '');
    stream(cust);

    test.ok(tracing.eventLoop({
//        log: function (effect) { console.log('DEBUG', effect); },
        fail: function (e) { console.log('ERROR!', e); }
    }));
    test.done();
/*
    require('../fixture.js').testEventLoop(test, 3, tracing.eventLoop, log);
*/
};

test['empty array returns end marker'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var cust = sponsor(function (r) {
        log('cust:', r);
        test.equal(0, r.pos);
        test.strictEqual(undefined, r.token);
    });

    var stream = input.fromArray(sponsor, []);
    stream(cust);

    test.ok(tracing.eventLoop());
    test.done();
};

var multilineFixture = function multilineFixture(test, sponsor) {
    var fixture = {
        expect: 17,
        source: '\r\n\n\r'
    };
    var c0 = fixture.c0 = sponsor(function (r) {
        log('c0:', r);
        test.strictEqual(0, r.pos);
        test.strictEqual('\r', r.value);
        test.strictEqual(0, r.row);
        test.strictEqual(0, r.col);
        r.next(c1);
    });
    var c1 = fixture.c1 = sponsor(function (r) {
        log('c1:', r);
        test.strictEqual(1, r.pos);
        test.strictEqual('\n', r.value);
        test.strictEqual(0, r.row);
        test.strictEqual(1, r.col);
        r.next(c2);
    });
    var c2 = fixture.c2 = sponsor(function (r) {
        log('c2:', r);
        test.strictEqual(2, r.pos);
        test.strictEqual('\n', r.value);
        test.strictEqual(1, r.row);
        test.strictEqual(0, r.col);
        r.next(c3);
    });
    var c3 = fixture.c3 = sponsor(function (r) {
        log('c3:', r);
        test.strictEqual(3, r.pos);
        test.strictEqual('\r', r.value);
        test.strictEqual(2, r.row);
        test.strictEqual(0, r.col);
        r.next(c4);
    });
    var c4 = fixture.c4 = sponsor(function (r) {
        log('c4:', r);
        //test.strictEqual(4, r.pos);
        test.strictEqual(undefined, r.value);
        //test.strictEqual(3, r.row);
        //test.strictEqual(0, r.col);
    });
    log('multilineFixture:', fixture);
    return fixture;
};
test['string helper counts lines'] = function (test) {
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var fixture = multilineFixture(test, sponsor);
    test.expect(fixture.expect + 1);

    var stream = input.fromString(sponsor, fixture.source);
    stream(fixture.c0);

    test.ok(tracing.eventLoop());
    test.done();
};

test['characters transform-stream counts lines'] = function (test) {
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var fixture = multilineFixture(test, sponsor);
    test.expect(fixture.expect + 1);

    var ts = input.characters();
    ts.write(fixture.source);
    ts.end();

    var stream = input.fromReadable(sponsor, ts);
    stream(fixture.c0);

    require('../fixture.js').testEventLoop(test, 3, tracing.eventLoop, log);
};

var arrayFixture = function arrayFixture(test, sponsor) {
    var fixture = {
        expect: 8,
        source: [
            42,
            'foo',
            { type:'operator', name:'=' }
        ]
    };
    var c0 = fixture.c0 = sponsor(function (r) {
        log('c0:', r);
        test.strictEqual(0, r.pos);
        test.strictEqual(42, r.value);
        r.next(c1);
    });
    var c1 = fixture.c1 = sponsor(function (r) {
        log('c1:', r);
        test.strictEqual(1, r.pos);
        test.strictEqual('foo', r.value);
        r.next(c2);
    });
    var c2 = fixture.c2 = sponsor(function (r) {
        log('c2:', r);
        test.strictEqual(2, r.pos);
        test.strictEqual('object', typeof r.value);
        r.next(c3);
    });
    var c3 = fixture.c3 = sponsor(function (r) {
        log('c3:', r);
        test.strictEqual(undefined, r.value);
    });
    log('arrayFixture:', fixture);
    return fixture;
};
test['array stream handles many types'] = function (test) {
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var fixture = arrayFixture(test, sponsor);
    test.expect(fixture.expect);

    var stream = input.fromArray(sponsor, fixture.source);
    stream(fixture.c0);

    test.ok(tracing.eventLoop());
    test.done();
/*
    require('../fixture.js').testEventLoop(test, 3, tracing.eventLoop, log);
*/
};
