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

//var log = console.log;
var log = function () {};

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
    cr.on('data', function onData(obj) {
        log('data:', obj);
        test.equal(ar[obj.pos], obj.value);
    });
    cr.on('end', function onEnd() {
        log('end.');
        test.done();
    });
    ws.write('.\r\r\n\n!');
    ws.end();
};

test['countRowCol() handles different line endings'] = function (test) {
    test.expect(24);

    var ws = s.characters();
    ws.end('.\r\r\n\n!');
    var rc = ws.pipe(s.countRowCol());
    var ar = [
        { value:'.', pos:0, row:0, col:0 }, 
        { value:'\r', pos:1, row:0, col:1 }, 
        { value:'\r', pos:2, row:1, col:0 }, 
        { value:'\n', pos:3, row:1, col:1 }, 
        { value:'\n', pos:4, row:2, col:0 }, 
        { value:'!', pos:5, row:3, col:0 }
    ];
    rc.on('data', function onData(actual) {
        var expect = ar.shift();
        log('data:', expect, actual);
        test.strictEqual(expect.value, actual.value);
        test.strictEqual(expect.pos, actual.pos);
        test.strictEqual(expect.row, actual.row);
        test.strictEqual(expect.col, actual.col);
    });
    rc.on('end', function onEnd() {
        log('end.');
        test.done();
    });
};

test['arrayStream() provides objects'] = function (test) {
    test.expect(18);

    var ar = [
        { value:'.', row:0, col:0 }, 
        { value:'\r', row:0, col:1 }, 
        { value:'\r', row:1, col:0 }, 
        { value:'\n', row:1, col:1 }, 
        { value:'\n', row:2, col:0 }, 
        { value:'!', row:3, col:0 }
    ];
    var rs = s.arrayStream(ar);
    rs.on('data', function onData(object) {
        log('data object:', object);
        var expect = ar.shift();
        var actual = object.value;
        log('data:', expect, actual);
        test.strictEqual(expect.value, actual.value);
        test.strictEqual(expect.row, actual.row);
        test.strictEqual(expect.col, actual.col);
    });
    rs.on('end', function onEnd() {
        log('end.');
        test.done();
    });
};

test['characters() can feed actor-based stream'] = function (test) {
    test.expect(8);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var sa = require('../dataflow.js').factory(sponsor, log);
    var source = sa.unbound();
    var next = source;
    var ws = s.characters();
    var rs = ws.pipe(s.countRowCol()); //ws;
    rs.on('data', function onData(obj) {
        log('data:', obj, next);
        obj.next = sa.unbound();
        next(obj);
        next = obj.next;
    });
    rs.on('end', function onEnd() {
        log('end:', next);
        next({ next: next });  // end of stream
    });
    ws.write('.\r\r\n\n!');
    ws.end();
/*
    var source = require('../input.js').fromString(sponsor, '.\r\r\n\n!');
*/

    var ar = ['.', '\r', '\r', '\n', '\n', '!'];
    var match = sponsor(function matchBeh(m) {
        var first = ar.shift();  // consume first expected result value
        log('matchBeh'+this.self+':', m, JSON.stringify(first));
        test.equal(first, m.value);
        if (first !== undefined) {
            m.next(this.self);
        }
    });
    source(match);  // start reading the actor-based stream

    require('../fixture.js').testEventLoop(test, 3, tracing.eventLoop, log);
};
