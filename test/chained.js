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
var PEG = require('../PEG.js');
var input = require('../input.js');

//var log = console.log;
var log = function () {};

test['object sequence matches object-list source'] = function (test) {
    test.expect(5);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var pf = PEG.factory(sponsor);
    var ns = pf.namespace(log);
    ns.define('objects',
        pf.sequence([
            pf.object({ type:'name' }),
            pf.object({ type:'operator', value:'=' }),
            pf.object({ value:'42' })
        ])
    );

    var tokens = [
        { type:'name', value:'answer' },
        { type:'operator', value:'=' },
        { type:'number', value:'42' }
    ];
    var source = input.fromArray(sponsor, tokens);

    var ok = sponsor(function okBeh(r) {
        log('OK:', JSON.stringify(r, null, 2));
        test.equal(3, r.value.length);
        test.equal('name', r.value[0].type);
        test.equal('operator', r.value[1].type);
        test.equal('number', r.value[2].type);
    });
    var fail = sponsor(function failBeh(r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

    var start = pf.start(
        ns.call('objects'),
        ok,
        fail
    );
    source(start);

    require('../fixture.js').asyncRepeat(3,
        function action() {
            return tracing.eventLoop({
//                count: 100,
//                log: function (effect) { console.log('DEBUG', effect); },
              fail: function (error) { console.log('FAIL!', error); }
            });
        },
        function callback(error, result) {
            log('asyncRepeat callback:', error, result);
            test.ok(!error && result);
            test.done();
        }
    );
};

/*
    var pf = PEG.factory(sponsor);
    var ns = pf.namespace(log);
    ns.define('tokens',
        pf.star(
            pf.any
        )
    );
*/
