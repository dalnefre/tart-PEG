/*

sample.js - sample usage of full PEG toolchain

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
var tracing = tart.tracing();
var sponsor = tracing.sponsor;

var PEG = require('../PEG.js');
var input = require('../input.js');

//var log = console.log;
var log = function () {};

var ns = require('./LISP.js').build(sponsor, log);
require('./reduceLISP.js').transform(ns);

/*
var source = '(CAR ( LIST 0 1)\t)';
*/
var source = ''
+ '; Fibonacci example from http://www.vpri.org/pdf/tr2010003_PEG.pdf\n'
+ '(define nfibs\n'
+ '  (lambda (n)\n'
+ '    (if (< n 2)\n'
+ '      1\n'
+ '      (+ 1 (+ (nfibs (- n 1)) (nfibs (- n 2)))))))\n'
+ '(print (nfibs 32))\n'
+ '; expected result: 2178309\n';

var next = require('../input.js').fromString(sponsor, source);

var ok = sponsor(function okBeh(m) {
    log('OK:', JSON.stringify(m, null, '  '));
    process.stdout.write(JSON.stringify(m.value, null, '  ')+'\n');
});
var fail = sponsor(function failBeh(m) {
    console.log('FAIL:', JSON.stringify(m, null, '  '));
});

var start = sponsor(ns.lookup('sexpr'));
var matcher = sponsor(PEG.start(start, ok, fail));
next(matcher);

require('../fixture.js').asyncRepeat(3,
    function eventLoop() {
        return tracing.eventLoop({
//            count: 10000,
//            log: function (effect) { console.log('DEBUG', effect); },
            fail: function (error) { console.log('FAIL!', error); }
        });
    }
);
