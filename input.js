/*

input.js - actor-based input streams

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

var input = module.exports;

var PEG = require('./PEG.js');

//var log = console.log;
var log = function () {};

var fromReadable = input.fromReadable = function fromReadable(sponsor, readable, pos) {
    var sa = require('./dataflow.js').factory(sponsor, log);
    var source = sa.unbound();
    var next = source;
    pos = pos || 0;
    readable.on('data', function onData(obj) {
        log('data:', obj, next);
        if (typeof obj !== 'object') {
            obj = { value: obj };
        }
        obj.pos = pos;
        obj.next = sa.unbound();
        log('data-obj:', obj);
        next(obj);
        next = obj.next;
        ++pos;
    });
    readable.on('end', function onEnd() {
        log('end:', next);
        var obj = {
            pos: pos,
            next: next
        };
        log('end-obj:', obj);
        next(obj);  // end of stream
    });
    log('fromReadable:', source);
    return source;
};

var fromString = input.fromString = function fromString(sponsor, seq) {
    var s = require('./stream.js');
    var ws = s.characters();
    var rs = ws.pipe(s.countRowCol()); //ws;
    var next = input.fromReadable(sponsor, rs);
    ws.end(seq);
    log('fromString:', next);
    return next;
};

var fromStream = input.fromStream = function fromStream(sponsor, source) {
    var s = require('./stream.js');
    var ws = source.pipe(s.characters());
    var rs = ws.pipe(s.countRowCol()); //ws;
    var next = input.fromReadable(sponsor, rs);
    log('fromStream:', next);
    return next;
};

var fromArray = input.fromArray = input.fromSequence = function fromArray(sponsor, source) {
    var sa = require('./dataflow.js').factory(sponsor, log);
    var makeNext = function makeNext(source, pos) {
        var value = source[pos];
        var obj = { pos: pos };
        var next = sa.bound(obj);
        if (value !== undefined) {
            obj.value = value;
            obj.next = makeNext(source, pos + 1);
        } else {
            obj.next = next;
        }
        log('makeNext:', next, obj);
        return next;
    };
    var next = makeNext(source, 0);
    log('fromArray:', next);
    return next;
};

var fromPEG = input.fromPEG = function fromPEG(sponsor, source, pattern) {
    var stream = require('stream');
    var rs = new stream.Readable({ objectMode: true });
    var ok = sponsor(function okBeh(r) {
        log('fromPEG.OK:', JSON.stringify(r, null, 2));
        rs.push(r);
        log('fromPEG.push:', r);
        pattern({  // try to match the next token
            input: r.end,
            ok: ok,  // this.self
            fail: fail
        });
    });
    var fail = sponsor(function failBeh(r) {
        log('fromPEG.FAIL:', JSON.stringify(r, null, 2));
        rs.push(null);  // end stream
        log('fromPEG.end');
    });

    var start = sponsor(PEG.start(pattern, ok, fail));
    source(start);

    var next = input.fromReadable(sponsor, rs);
    log('fromPEG:', next);
    return next;
};
