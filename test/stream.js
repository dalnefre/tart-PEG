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
var s = require('../stream.js');

var log = console.log;
//var log = function () {};

var test = module.exports = {};   

test['transform calls flush at end of stream'] = function (test) {
    test.expect(4);

    var ts = new require('stream').Transform({ objectMode: true });
//    ts._transform = function _transform(chunk, encoding, callback) {
    ts._transform = function _transform(obj, _ignored_, callback) {
        log('_transform:', JSON.stringify(arguments));
        test.equal('zero', obj.name);
        test.equal(0, obj.pos);
        test.ok(callback);
        callback();
    };
    ts._flush = function _flush(callback) {
        log('_flush:', JSON.stringify(arguments));
        test.ok(callback);
        test.done();
        callback();
    };

    ts.write({ name:'zero', pos:0 });
    ts.end();
};

test['characters() reads individual characters'] = function (test) {
    test.expect(6);

    var ws = s.characters();
    var cr = ws;
    var ar = ['.', '\r', '\r', '\n', '\n', '!'];
    cr.on('readable', function onReadable() {
        var obj = cr.read();
        log('readable:', obj);
        if (obj) {
            test.equal(ar[obj.pos], obj.value);
        } else {
            test.done();
        }
    });
    ws.write('.\r\r\n\n!');
    ws.end();
};

test['countRowCol() handles different line endings'] = function (test) {
    test.expect(24);

    var ws = s.characters();
    var rc = ws.pipe(s.countRowCol());
    var ar = [
        { value:'.', pos:0, row:0, col:0 }, 
        { value:'\r', pos:1, row:0, col:1 }, 
        { value:'\r', pos:2, row:1, col:0 }, 
        { value:'\n', pos:3, row:1, col:1 }, 
        { value:'\n', pos:4, row:2, col:0 }, 
        { value:'!', pos:5, row:3, col:0 }
    ];
    rc.on('readable', function onReadable() {
        var expect = ar.shift();
        var actual = rc.read();
        log('readable:', expect, actual);
        if (!actual) {
        	return test.done();
        }
        test.strictEqual(expect.value, actual.value);
        test.strictEqual(expect.pos, actual.pos);
        test.strictEqual(expect.row, actual.row);
        test.strictEqual(expect.col, actual.col);
    });
    ws.write('.\r\r\n\n!');
    ws.end();
};

test['arrayStream() provides objects'] = function (test) {
    test.expect(24);

    var ar = [
        { value:'.', pos:0, row:0, col:0 }, 
        { value:'\r', pos:1, row:0, col:1 }, 
        { value:'\r', pos:2, row:1, col:0 }, 
        { value:'\n', pos:3, row:1, col:1 }, 
        { value:'\n', pos:4, row:2, col:0 }, 
        { value:'!', pos:5, row:3, col:0 }
    ];
    var rs = s.arrayStream(ar);
    rs.on('readable', function onReadable() {
        var object = rs.read();
        log('readable object:', object);
        if (!object) {
        	return test.done();
        }
        var expect = ar.shift();
        var actual = object.value;
        log('readable:', expect, actual);
        test.strictEqual(expect.value, actual.value);
        test.strictEqual(expect.pos, actual.pos);
        test.strictEqual(expect.row, actual.row);
        test.strictEqual(expect.col, actual.col);
    });
};

test['characters() can feed actor-based stream'] = function (test) {
    test.expect(8);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var ws = s.characters();
    var rs = ws; //ws.pipe(s.countRowCol());
    var ar = ['.', '\r', '\r', '\n', '\n', '!'];
    var makeNext = function makeNext() {
        return function nextBeh(msg) {
            log('nextBeh'+this.self+':', msg);
            if (typeof msg === 'function') {  // msg = customer
                this.behavior = makeWait([msg]);
            } else if (typeof msg === 'object') {  // msg = result
                this.behavior = makeCache(msg);
            }
        };
    };
    var makeWait = function makeWait(waiting) {
        return function waitBeh(msg) {
            log('waitBeh'+this.self+':', msg, waiting);
            if (typeof msg === 'function') {  // msg = customer
                waiting.push(msg);
            } else if (typeof msg === 'object') {  // msg = result
                this.behavior = makeCache(msg);
                waiting.forEach(function (item, index, array) {
                    item(msg);
                });
            }
        };
    };
    var makeCache = function makeCache(result) {
        return function cacheBeh(cust) {
            log('cacheBeh'+this.self+':', cust, result);
            if (typeof cust === 'function') {
                cust(result);
            }
        };
    };
    var next = sponsor(makeNext());
    rs.on('readable', function onReadable() {
        var obj = rs.read();
        log('readable:', obj, next);
        if (obj) {
            obj.next = sponsor(makeNext());
            next(obj);
            next = obj.next;
        } else {
            next({ next: next });  // end of stream
        }
    });
/*
    rs.on('end', function onEnd() {
        log('end:', next);
        next({ end: true, next: next });  // end of stream
    });
*/
    var match = sponsor(function matchBeh(m) {
        var first = ar.shift();  // consume first expected result value
        log('matchBeh'+this.self+':', m, JSON.stringify(first));
        test.equal(first, m.value);
        if (first !== undefined) {
            m.next(this.self);
        }
    });
    next(match);  // start reading the actor-based stream
    ws.write('.\r\r\n\n!');
    ws.end();

/*
    test.ok(tracing.eventLoop());
*/
    test.ok(tracing.eventLoop({
        count: 100,
//        log: function (effect) { console.log('DEBUG', effect); },
        fail: function (exception) { console.log('FAIL!', exception); }
    }));
    test.done();
};
