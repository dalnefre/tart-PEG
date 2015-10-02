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
var PEG = require('../index.js');

var named = require('../named.js');

//var log = console.log;
var log = function () {};

test['right recursion groups right-to-left'] = function (test) {
    test.expect(5);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var ns = named.scope(sponsor, { log: log });
    
    // Expr <- Term "-" Expr / Term
    ns.define('Expr',
        sponsor(PEG.choice([
            sponsor(PEG.sequence([
                ns.lookup('Term'),
                sponsor(PEG.terminal('-')),
                ns.lookup('Expr')
            ])),
            ns.lookup('Term')
        ]))
    );
    // Term <- [a-z]
    ns.define('Term',
        sponsor(PEG.predicate(function (token) {
            return /[a-z]/.test(token);
        }))
    );
    
    var ok = sponsor(function (r) {
        console.log('OK:', JSON.stringify(r, null, 2));
        var rule = r.value;
        test.equal('Expr', rule.rule);
        test.equal(3, rule.value.length);
        test.equal('Term', rule.value[0].rule);
        test.equal(5, r.in.offset);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', r);
    });

    var start = ns.lookup('Expr');
    start({
        in: {
            source: 'a-b-c',
            offset: 0
        },
        ok: ok,
        fail: fail
    });

    test.ok(tracing.eventLoop({ count: 100 }));
    test.done();
};

test['left recursion does not diverge'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var ns = named.scope(sponsor, { log: log });
    
    // Expr <- Expr "-" Term / Term
    ns.define('Expr',
        sponsor(PEG.choice([
            sponsor(PEG.sequence([
                ns.lookup('Expr'),
                sponsor(PEG.terminal('-')),
                ns.lookup('Term')
            ])),
            ns.lookup('Term')
        ]))
    );
    // Term <- [a-z]
    ns.define('Term',
        sponsor(PEG.predicate(function (token) {
            return /[a-z]/.test(token);
        }))
    );
    
    var ok = sponsor(function (r) {
        console.log('OK:', JSON.stringify(r, null, 2));
        var rule = r.value;
        test.equal('Expr', rule.rule);
        test.equal(1, r.in.offset);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', r);
    });

    var start = ns.lookup('Expr');
    start({
        in: {
            source: 'a-b-c',
            offset: 0
        },
        ok: ok,
        fail: fail
    });

    test.ok(tracing.eventLoop({ count: 100 }));
    test.done();
};

test['iteration makes a list'] = function (test) {
    test.expect(4);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var ns = named.scope(sponsor, { log: log });
    
    // Expr <- Term ("-" Term)*
    ns.define('Expr',
        sponsor(PEG.sequence([
            ns.lookup('Term'),
            sponsor(PEG.star(
                sponsor(PEG.sequence([
                    sponsor(PEG.terminal('-')),
                    ns.lookup('Term')
                ]))
            ))
        ]))
    );
    // Term <- [a-z]
    ns.define('Term',
        sponsor(PEG.predicate(function (token) {
            return /[a-z]/.test(token);
        }))
    );
    
    var ok = sponsor(function (r) {
        console.log('OK:', JSON.stringify(r, null, 2));
        var rule = r.value;
        test.equal('Expr', rule.rule);
        test.equal(2, rule.value.length);
        test.equal(5, r.in.offset);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', r);
    });

    var start = ns.lookup('Expr');
    start({
        in: {
            source: 'a-b-c',
            offset: 0
        },
        ok: ok,
        fail: fail
    });

    test.ok(tracing.eventLoop({ count: 100 }));
    test.done();
};
