/*

stream.js - actor-based interface to streams2/3

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

var s = module.exports;

var stream = require('stream');

var log = console.log;
//var log = function () {};

s.characters = function characters() {
    var ts = new stream.Transform({ objectMode: true });
    var pos = 0;
    ts._transform = function _transform(chunk, encoding, callback) {
        log('chars_transform:', JSON.stringify(arguments));
        var sa = chunk.toString(encoding).split('');
        log('chars_sa:', sa);
        sa.forEach(function (ch) {
            ts.push({
                pos: pos,
                value: ch
            });
            pos += 1;
        });
        callback();
    };
    ts._flush = function _flush(callback) {
        log('chars_flush:', JSON.stringify(arguments));
        callback();
    };
    return ts;
};

s.countRowCol = function countRowCol() {
    var ts = new stream.Transform({ objectMode: true });
    var row = 0;
    var col = 0;
    var prev;
    ts._transform = function _transform(obj, _ignored_, callback) {
        log('count_transform:', JSON.stringify(arguments));
        if ((prev === '\n') 
        ||  ((prev === '\r') && (obj.value !== '\n'))) {
            row += 1;
            col = 0;
        }
        obj.row = row;
        obj.col = col;
        log('count_obj:', obj);
        ts.push(obj);
        col += 1;
        prev = obj.value;
        callback();
    };
    ts._flush = function _flush(callback) {
        log('count_flush:', JSON.stringify(arguments));
        callback();
    };
    return ts;
};
