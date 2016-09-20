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

var memo = input.memo = function memo(streamBeh) {
    var waiting = [];
    var result;
    var initBeh = function initBeh(cust) {
        log('input.memo[init]:', cust);
        var stream = this.sponsor(streamBeh);
        waiting.push(cust);
        this.behavior = waitBeh;
        stream(this.self);
    };
    var waitBeh = function waitBeh(msg) {
        log('input.memo[wait]:', msg);
        if (typeof msg === 'function') {
            waiting.push(msg);
        } else {
            result = msg;
            for (var i = 0; i < waiting.length; ++i) {
                waiting[i](result);
            }
            waiting = null;  // release waiting list
            this.behavior = cacheBeh;
        }
    };
    var cacheBeh = function cacheBeh(cust) {
        log('input.memo[cache]:', cust, result);
        cust(result);
    };
    return initBeh;
};

var stringStream = input.stringStream = function stringStream(seq, prev) {  // [DEPRECATED]
    log('stringStream(seq, prev):', JSON.stringify(seq), prev);
    prev = prev || {
        row: 0,
        col: -1,
        pos: -1
    };
    return input.memo(function streamBeh(cust) {
        log('stringStream.prev:', prev);
        var pos = prev.pos + 1;
        var row = prev.row;
        var col = prev.col + 1;
        var token = seq[pos];
        log('stringStream:', pos, JSON.stringify(token), row, col);
        if ((prev.value === '\n')
        ||  ((prev.value === '\r') && (token !== '\n'))) {
            row += 1;
            col = 0;
        }
        if (token) {
            var curr = {
                token: token,  // [DEPRECATED]
                value: token,
                row: row,
                col: col,
                pos: pos
            };
            curr.next = this.sponsor(stringStream(seq, curr));
            log('stringStream.curr:', curr);
            cust(curr);
        } else {
            var end = {
                row: row,
                col: col,
                pos: pos
            };
            end.next = this.sponsor(function endBeh(cust) {
                cust(end);
            });
            log('stringStream.end:', end);
            cust(end);
        }
    });
};

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

var fromArray = input.fromArray = function fromArray(sponsor, source) {
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
