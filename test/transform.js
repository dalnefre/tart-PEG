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

var log = console.log;
//var log = function () {};

var tart = require('tart-tracing');
var PEG = require('../PEG.js');
var input = require('../input.js');

// name, value ==> value
var transformValue = (name, value) => {
    log('transformValue:', name, value);
    var result = value;
    log('Value:', result);
    return result;
};

test['right recursion is right-associative'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var pf = PEG.factory(sponsor);
    var ns = pf.namespace(/*log*/);
    
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
    ns.transform('List', transformValue);
    // Item <- [a-z]
    ns.define('Item',
        pf.predicate(token => /[a-z]/.test(token))
    );
    ns.transform('Item', transformValue);
    
    var ok = sponsor(function (m) {
        var v = m.value;
        log('OK.value:', JSON.stringify(v, null, 2));
        test.deepEqual(v, [
            'a',
            ',',
            [
                'b',
                ',',
                [
                    'c',
                    ',',
                    'd'
                ]
            ]
        ]);
    });
    var fail = sponsor(function (m) {
        console.log('FAIL:', m);
    });

    var matcher =  pf.matcher(ns.call('List'), ok, fail);
    var stream = input.fromString(sponsor, 'a,b,c,d');
    stream(matcher);

    test.ok(tracing.eventLoop({ count: 1000 }), 'Exceeded message limit');
    test.done();
};

test['left recursion fails safely'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var pf = PEG.factory(sponsor);
    var ns = pf.namespace(/*log*/);
    
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
    ns.transform('Expr', transformValue);
    // Term <- [a-z]
    ns.define('Term',
        pf.predicate(token => /[a-z]/.test(token))
    );
    ns.transform('Term', transformValue);

    var ok = sponsor(function (m) {
        var v = m.value;
        log('OK.value:', JSON.stringify(v, null, 2));
        test.deepEqual(v, 'a');
    });
    var fail = sponsor(function (m) {
        console.log('FAIL:', m);
    });

    var matcher =  pf.matcher(ns.call('Expr'), ok, fail);
    var stream = input.fromString(sponsor, 'a-b-c-d');
    stream(matcher);

    test.ok(tracing.eventLoop({ count: 1000 }), 'Exceeded message limit');
    test.done();
};

test['suffix iteration is left-associative'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var pf = PEG.factory(sponsor);
    var ns = pf.namespace(/*log*/);
    
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
    ns.transform('Expr', transformValue);
    // Term <- [a-z]
    ns.define('Term',
        pf.predicate(token => /[a-z]/.test(token))
    );
    ns.transform('Term', transformValue);
    
    var ok = sponsor(function (m) {
        var v = m.value;
        log('OK.value:', JSON.stringify(v, null, 2));
        test.deepEqual(v, [
            'a',
            [
                [
                    '-',
                    'b'
                ],
                [
                    '-',
                    'c'
                ],
                [
                    '-',
                    'd'
                ]
            ]
        ]);
    });
    var fail = sponsor(function (m) {
        console.log('FAIL:', m);
    });

    var matcher =  pf.matcher(ns.call('Expr'), ok, fail);
    var stream = input.fromString(sponsor, 'a-b-c-d');
    stream(matcher);

    test.ok(tracing.eventLoop({ count: 1000 }), 'Exceeded message limit');
    test.done();
};

test['prefix iteration is right-associative'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var pf = PEG.factory(sponsor);
    var ns = pf.namespace(/*log*/);
    
    // List <- (Item ',')* Item
    ns.define('List',
        pf.sequence([
            pf.zeroOrMore(
                pf.sequence([
                    ns.call('Item'),
                    pf.terminal(',')
                ])
            ),
            ns.call('Item')            
        ])
    );
    ns.transform('List', transformValue);
    // Item <- [a-z]
    ns.define('Item',
        pf.predicate(token => /[a-z]/.test(token))
    );
    ns.transform('Item', transformValue);
    
    var ok = sponsor(function (m) {
        var v = m.value;
        log('OK.value:', JSON.stringify(v, null, 2));
        test.deepEqual(v, [
            [
                [
                    'a',
                    ','
                ],
                [
                    'b',
                    ','
                ],
                [
                    'c',
                    ','
                ]
            ],
            'd'
        ]);
    });
    var fail = sponsor(function (m) {
        console.log('FAIL:', m);
    });

    var matcher =  pf.matcher(ns.call('List'), ok, fail);
    var stream = input.fromString(sponsor, 'a,b,c,d');
    stream(matcher);

    test.ok(tracing.eventLoop({ count: 1000 }), 'Exceeded message limit');
    test.done();
};
