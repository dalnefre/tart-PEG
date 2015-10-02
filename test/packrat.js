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
var PEG = require('../index.js');

var test = module.exports = {};   

var no_log = function () {};

test['packrat is just memoization'] = function (test) {
    test.expect(5);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var ok = sponsor(function (m) {
        test.equal(2, m.value.length);
        test.equal('-', m.value[0]);
        test.equal('-', m.value[1]);
        test.equal(2, m.in.offset);
    });
    var fail = sponsor(function (m) {
        console.log('FAIL!', m);
    });

    var minus = sponsor(PEG.terminal('-'));
//    minus = sponsor(PEG.packrat(minus));
    minus = sponsor(PEG.packrat(minus, 'DASH', no_log));
    var leftArrow = sponsor(PEG.sequence([
        sponsor(PEG.terminal('<')),
        minus,
        minus
    ]));
    var rightArrow = sponsor(PEG.sequence([
        minus,
        minus,
        sponsor(PEG.terminal('>'))
    ]));
    var emDash = sponsor(PEG.sequence([
        minus,
        minus,
        minus
    ]));
    var enDash = sponsor(PEG.sequence([
        minus,
        minus
    ]));
    var rule = sponsor(PEG.choice([
        leftArrow,
        rightArrow,
        emDash,
        enDash
    ]));

    rule({
        in: {
            source: '-- ',
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop({ count: 100 }));
    test.done();
};
