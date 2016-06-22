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

var log = console.log;
//var log = function () {};

var end = input.end = {
    next: function next(cust) {
        cust(end);
    }
};

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
        log('input.memo[wait]:', cust);
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

var arrayStream = input.arrayStream = function arrayStream(seq, pos) {  // [DEPRECATED]
    pos = pos || 0;
    return input.memo(function streamBeh(cust) {
        var token = seq[pos];
        log('arrayStream:', pos, JSON.stringify(token));
        if (pos < seq.length) {
            cust({
                token: seq[pos],  // [DEPRECATED]
                value: seq[pos],
                pos: pos,
                next: this.sponsor(arrayStream(seq, pos + 1))
            });
        } else {
            var end = {
                pos: pos
            };
            end.next = this.sponsor(function endBeh(cust) {
                cust(end);
            });
            cust(end);
        }
    });
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

var fromReadable = input.fromReadable = function fromReadable(sponsor, readable) {
    var makeNext = function makeNext() {
        return function nextBeh(msg) {
            log('nextBeh'+this.self+':', msg);
            if (typeof msg === 'function') {  // msg = customer
                this.behavior = makeWait([msg]);
            } else if (typeof msg === 'object') {  // msg = result
                this.behavior = makeCache(msg);
            } else {
                log(this.self+' IGNORED', typeof cust);
            }
            log(this.self+'.behavior', this.behavior);
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
            } else {
                log(this.self+' IGNORED', typeof cust);
            }
        };
    };
    var makeCache = function makeCache(result) {
        return function cacheBeh(cust) {
            log('cacheBeh'+this.self+':', cust, result);
            if (typeof cust === 'function') {
                cust(result);
            } else {
                log(this.self+' IGNORED', typeof cust);
            }
        };
    };

    var next = sponsor(makeNext());
    readable.on('readable', function onReadable() {
        var obj = readable.read();
        log('readable:', obj, next);
        if (obj) {
            obj.next = sponsor(makeNext());
            log('readable-next:', obj);
            next(obj);
            next = obj.next;
        } else {
            obj = { next: next };
            log('readable-end:', obj);
            next(obj);  // end of stream
        }
    });
/*
*/
    readable.on('end', function onEnd() {
        log('end:', next);
        var obj = { end: true, next: next };
        log('end-end:', obj);
        next(obj);  // end of stream
    });
    log('fromReadable:', next);
    return next;
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
    var s = require('./stream.js');
    var rs = s.arrayStream(source);
    var next = input.fromReadable(sponsor, rs);
    log('fromArray:', next);
    return next;
};
