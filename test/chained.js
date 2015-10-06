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

test['object matches empty expected object'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var start = sponsor(PEG.object({}));

    var ok = sponsor(function (r) {
        test.equal('name', r.value.type);
        test.equal('answer', r.value.value);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

    start({
        in: {
            source: [
                { type:'name', value:'answer' }
            ],
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['object matches single expected property'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var start = sponsor(PEG.object({ type:'name' }));

    var ok = sponsor(function (r) {
        test.equal('name', r.value.type);
        test.equal('answer', r.value.value);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

    start({
        in: {
            source: [
                { type:'name', value:'answer' }
            ],
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['object matches all expected properties'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var start = sponsor(PEG.object({ type:'name', value:'answer' }));

    var ok = sponsor(function (r) {
        test.equal('name', r.value.type);
        test.equal('answer', r.value.value);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

    start({
        in: {
            source: [
                { type:'name', value:'answer' }
            ],
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['object fails to match on missing property'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var start = sponsor(PEG.object({ value:'answer', lang:'en' }))

    var ok = sponsor(function (r) {
        console.log('OK:', JSON.stringify(r, null, 2));
    });
    var fail = sponsor(function (r) {
        test.equal(0, r.in.offset);
    });

    start({
        in: {
            source: [
                { type:'name', value:'answer' }
            ],
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['object sequence matches object-list source'] = function (test) {
    test.expect(5);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var start = sponsor(PEG.sequence([
        sponsor(PEG.object({ type:'name' })),
        sponsor(PEG.object({ type:'operator', value:'=' })),
        sponsor(PEG.object({ value:'42' }))
    ]));

    var ok = sponsor(function (r) {
        test.equal(3, r.value.length);
        test.equal('name', r.value[0].type);
        test.equal('operator', r.value[1].type);
        test.equal('number', r.value[2].type);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

    start({
        in: {
            source: [
                { type:'name', value:'answer' },
                { type:'operator', value:'=' },
                { type:'number', value:'42' }
            ],
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop());
    test.done();
};
