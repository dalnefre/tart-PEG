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

//var log = console.log;
var log = function () {};

s.characters = function characters() {
    log('stream:', stream);
    var ts = new stream.Transform({ objectMode: true });
    log('ts:', ts);
    var pos = 0;
    ts._transform = function _transform(chunk, encoding, callback) {
        log('_transform:', chunk, encoding, callback);
        var sa = chunk.toString(encoding).split('');
        log('sa:', sa);
        sa.forEach(function (ch) {
            ts.push({
                pos: pos,
                value: ch
            });
            pos += 1;
        });
    };
    ts._flush = function _flush(callback) {
        log('_flush:', callback);
        callback();
    };
    return ts;
};
