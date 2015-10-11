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

var test = module.exports = {};   

var tart = require('tart-tracing');
//var PEG = require('../index.js');
var PEG = require('../PEG.js');
var input = require('../input.js');

var log = console.log;
//var log = function () {};

test['packrat is just memoization'] = function (test) {
    test.expect(5);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var minus = sponsor(PEG.terminal('-'));
//    minus = sponsor(PEG.packrat(minus));
    minus = sponsor(PEG.packrat(minus, 'DASH', log));
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
    var start = sponsor(PEG.choice([
        leftArrow,
        rightArrow,
        emDash,
        enDash
    ]));

    var ok = sponsor(function (r) {
        log('OK:', JSON.stringify(r, null, 2));
        test.equal(2, r.value.length);
        test.equal('-', r.value[0]);
        test.equal('-', r.value[1]);
        test.equal(2, r.end.pos);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

    var matcher = sponsor(PEG.start(start, ok, fail));
    var stream = sponsor(input.stringStream('-- '));
    stream(matcher);
    
    test.ok(tracing.eventLoop({ count: 100 }));
    test.done();
};

test['namespace defaults to packrat and named value transform'] = function (test) {
    test.expect(9);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var ns = PEG.namespace(log);
    ns.define('minus',
        sponsor(PEG.terminal('-'))
    );
    ns.define('leftArrow',
        sponsor(PEG.sequence([
            sponsor(PEG.terminal('<')),
            sponsor(ns.lookup('minus')),
            sponsor(ns.lookup('minus'))
        ]))
    );
    ns.define('rightArrow',
        sponsor(PEG.sequence([
            sponsor(ns.lookup('minus')),
            sponsor(ns.lookup('minus')),
            sponsor(PEG.terminal('>'))
        ]))
    );
    ns.define('emDash',
        sponsor(PEG.sequence([
            sponsor(ns.lookup('minus')),
            sponsor(ns.lookup('minus')),
            sponsor(ns.lookup('minus'))
        ]))
    );
    ns.define('enDash',
        sponsor(PEG.sequence([
            sponsor(ns.lookup('minus')),
            sponsor(ns.lookup('minus'))
        ]))
    );
    ns.define('start',
        sponsor(PEG.choice([
            sponsor(ns.lookup('leftArrow')),
            sponsor(ns.lookup('rightArrow')),
            sponsor(ns.lookup('emDash')),
            sponsor(ns.lookup('enDash'))
        ]))
    );

    var ok = sponsor(function (r) {
        log('OK:', JSON.stringify(r, null, 2));
        test.equal(2, r.end.pos);
        var v = r.value;
        test.equal('start', v.name);
        v = v.value;
        test.equal('enDash', v.name);
        v = v.value;
        test.equal(2, v.length);
        test.equal('minus', v[0].name);
        test.equal('-', v[0].value);
        test.equal('minus', v[1].name);
        test.equal('-', v[1].value);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

	var start = sponsor(ns.lookup('start'));
    var matcher = sponsor(PEG.start(start, ok, fail));
    var stream = sponsor(input.stringStream('-- '));
    stream(matcher);
    
    test.ok(tracing.eventLoop({ count: 1000 }));
    test.done();
};
