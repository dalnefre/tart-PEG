/*

readme.js - example from the README

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

//var log = console.log;
var log = function () {};

var tart = require('tart');
var sponsor = tart.minimal({
    fail: function (e) {
        console.log('ERROR!', e);
    }
});

var PEG = require('../PEG.js');
var input = require('../input.js');

var pf = PEG.factory(sponsor);
var ns = pf.namespace(log);

/*
Assign <- Name "=" Assign
        / Expr
*/
ns.define('Assign',
    pf.choice([
        pf.sequence([
            ns.call('Name'),
            pf.terminal('='),
            ns.call('Assign')
        ]),
        ns.call('Expr')
    ])
);

/*
Name   <- [a-zA-Z]
*/
ns.define('Name',
    pf.predicate(token => /[a-zA-Z]/.test(token))
);

/*
Expr   <- Term ([-+] Term)*
*/
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

/*
Term   <- Factor ([/*] Factor)*
*/
ns.define('Term',
    pf.sequence([
        ns.call('Factor'),
        pf.zeroOrMore(
            pf.sequence([
                pf.predicate(token => /[/*]/.test(token)),
                ns.call('Factor')
            ])
        )
    ])
);

/*
Factor <- "(" Assign ")"
        / Name
        / [0-9]+
*/
ns.define('Factor',
    pf.choice([
        pf.sequence([
            pf.terminal('('),
            ns.call('Assign'),
            pf.terminal(')')
        ]),
        ns.call('Name'),
        pf.oneOrMore(
            pf.predicate(token => /[0-9]/.test(token))
        )
    ])
);

var ok = sponsor(function okBeh(m) {
    console.log('OK:', JSON.stringify(m, null, '  '));
});
var fail = sponsor(function failBeh(m) {
    console.log('FAIL:', JSON.stringify(m, null, '  '));
});

var start = ns.call('Assign');
var matcher = pf.matcher(start, ok, fail);
var next = input.fromString(sponsor, 'x=y=10-2/3+4*5/(6-7)');
next(matcher);
