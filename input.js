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

var fromSequence = input.fromSequence = function fromSequence(sponsor, seq) {
    var sa = require('./dataflow.js').factory(sponsor, log);
    var makeNext = function makeNext(seq, pos) {
        var value = seq[pos];
        var obj = { pos: pos };
        var next = sa.bound(obj);
        if (value !== undefined) {
            obj.value = value;
            obj.next = makeNext(seq, pos + 1);
        } else {
            obj.next = next;
        }
        log('makeNext:', next, obj);
        return next;
    };
    var source = makeNext(seq, 0);
    log('fromSequence:', source);
    return source;
};

var posDecorator = input.posDecorator = function posDecorator(pos) {
    pos = pos || 0;
    return function decorate(item) {
        var obj = {
            pos: pos,
            value: item
        };
        pos += 1;
        return obj;
    };
};

var lineDecorator = input.lineDecorator = function lineDecorator(pos, row, col, prev) {
    pos = pos || 0;
    row = row || 0;
    col = col || 0;
    return function decorate(item) {
        if ((prev === '\n') 
        ||  ((prev === '\r') && (item !== '\n'))) {
            row += 1;
            col = 0;
        }
        var obj = {
            pos: pos,
            row: row,
            col: col,
            value: item
        };
        pos += 1;
        col += 1;
        prev = item;
        return obj;
    };
};

var characters = input.characters = function characters(options) {
    options = options || {};
    options.decorate = options.decorate || lineDecorator();
    var ts = new require('stream').Transform({ objectMode: true });
    if (options.keepCharacters) {
        ts.allCharacters = '';
    }
    ts._transform = function _transform(chunk, encoding, callback) {
        log('chars_transform:', JSON.stringify(arguments));
        var sa = chunk.toString(encoding).split('');
        log('chars_sa:', sa);
        sa.forEach(function (ch) {
            if (options.keepCharacters) {
                ts.allCharacters += ch;
            }
            var obj = options.decorate(ch);
            log('chars_push:', obj);
            ts.push(obj);
        });
        callback();
    };
    ts._flush = function _flush(callback) {
        log('chars_flush:', JSON.stringify(arguments));
        ts.push(null);  // end stream
        callback();
    };
    return ts;
};

var fromString = input.fromString = function fromString(sponsor, seq, decorate) {
    var sa = require('./dataflow.js').factory(sponsor, log);
    var source = sa.unbound();
    decorate = decorate || lineDecorator();
    var next = source;
    for (var i = 0; i < seq.length; ++i) {
        var obj = decorate(seq[i]);
        obj.next = sa.unbound();
        next(obj);
        next = obj.next;
    }
    var end = decorate();  // end-of-input
    end.next = next;
    next(end);
    log('fromString:', source);
    return source;
};

var fromArray = input.fromArray = function fromArray(sponsor, seq, decorate) {
    var sa = require('./dataflow.js').factory(sponsor, log);
    var source = sa.unbound();
    decorate = decorate || posDecorator();
    var next = source;
    seq.forEach(function (item/*, index, array*/) {
        var obj = decorate(item);
        obj.next = sa.unbound();
        next(obj);
        next = obj.next;
    });
    var end = decorate();  // end-of-input
    end.next = next;
    next(end);
    log('fromArray:', source);
    return source;
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

var fromStream = input.fromStream = function fromStream(sponsor, source) {
    var ts = source.pipe(input.characters());
    var next = input.fromReadable(sponsor, ts);
    log('fromStream:', next);
    return next;
};

var fromPEG = input.fromPEG = function fromPEG(sponsor, from, pattern) {
    var sa = require('./dataflow.js').factory(sponsor, log);
    var to = sa.unbound();
    var next = to;
    var pos = 0;
    var ok = sponsor(function okBeh(r) {
        log('fromPEG.OK:', JSON.stringify(r, null, 2));
        r.pos = pos;
        r.next = sa.unbound();
        log('fromPEG.obj:', r);
        next(r);
        next = r.next;
        pos += 1;
        pattern({  // try to match the next token
            input: r.end,
            ok: ok,  // this.self
            fail: fail
        });
    });
    var fail = sponsor(function failBeh(r) {
        log('fromPEG.FAIL:', JSON.stringify(r, null, 2));
        r.pos = pos;
        r.next = next;
        log('fromPEG.end:', r);
        next(r);
    });

    var start = sponsor(PEG.start(pattern, ok, fail));
    from(start);

    log('fromPEG:', to);
    return to;
};
