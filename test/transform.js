/*

test.js - test script

The MIT License (MIT)

Copyright (c) 2015-2016 Dale Schumacher

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

//var log = console.log;
var log = function () {};

var tart = require('tart-tracing');
var PEG = require('../PEG.js');
var input = require('../input.js');

test['right recursion is right-associative'] = function (test) {
    test.expect(5);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var pf = PEG.factory(sponsor);
    var ns = pf.namespace(log);
    
    // List <- Item ',' List / Item
    ns.define('List',
        pf.choice([
            pf.sequence([
                ns.call('Item'),
                pf.terminal(','),
                ns.call('List')
            ]),
            ns.call('Item')
        ])
    );
    // Item <- [a-z]
    ns.define('Item',
        pf.predicate(token => /[a-z]/.test(token))
    );
    
    var ok = sponsor(function (r) {
        log('OK:', JSON.stringify(r, null, 2));
        var rule = r.value;
        test.strictEqual(rule.name, 'List');
        test.strictEqual(rule.value.length, 3);
        test.strictEqual(rule.value[0].name, 'Item');
        test.strictEqual(r.end.pos, 5);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', r);
    });

    var matcher =  pf.matcher(ns.call('List'), ok, fail);
    var stream = input.fromString(sponsor, 'a,b,c');
    stream(matcher);

    test.ok(tracing.eventLoop({ count: 1000 }), 'Exceeded message limit');
    test.done();
};

test['left recursion fails safely'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var pf = PEG.factory(sponsor);
    var ns = pf.namespace(log);
    
    // Expr <- Expr [-+] Term / Term
    ns.define('Expr',
        pf.choice([
            pf.sequence([
                ns.call('Expr'),
                pf.predicate(token => /[-+]/.test(token)),
                ns.call('Term')
            ]),
            ns.call('Term')
        ])
    );
    // Term <- [a-z]
    ns.define('Term',
        pf.predicate(token => /[a-z]/.test(token))
    );

    var ok = sponsor(function (r) {
        log('OK:', JSON.stringify(r, null, 2));
        var rule = r.value;
        test.strictEqual(rule.name, 'Expr');
        test.strictEqual(r.end.pos, 1);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', r);
    });

    var matcher =  pf.matcher(ns.call('Expr'), ok, fail);
    var stream = input.fromString(sponsor, 'a-b-c');
    stream(matcher);

    test.ok(tracing.eventLoop({ count: 1000 }), 'Exceeded message limit');
    test.done();
};

test['suffix iteration left-associative'] = function (test) {
    test.expect(4);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var pf = PEG.factory(sponsor);
    var ns = pf.namespace(log);
    
    // Expr <- Term ([-+] Term)*
    ns.define('Expr',
        pf.sequence([
            ns.call('Term'),
            pf.zeroOrMore(
                pf.sequence([
                    pf.predicate(token => /[-+]/.test(token)),
                    ns.call('Term')
                ])
            )
        ])
    );
    // Term <- [a-z]
    ns.define('Term',
        pf.predicate(token => /[a-z]/.test(token))
    );
    
    var ok = sponsor(function (r) {
        log('OK:', JSON.stringify(r, null, 2));
        var rule = r.value;
        test.strictEqual(rule.name, 'Expr');
        test.strictEqual(rule.value.length, 2);
        test.strictEqual(r.end.pos, 5);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', r);
    });

    var matcher =  pf.matcher(ns.call('Expr'), ok, fail);
    var stream = input.fromString(sponsor, 'a-b-c');
    stream(matcher);

    test.ok(tracing.eventLoop({ count: 1000 }), 'Exceeded message limit');
    test.done();
};
