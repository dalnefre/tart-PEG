/*

readme.js - example from the README

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

var tart = require('tart');
var sponsor = tart.minimal({
    fail: function (e) {
        console.log('ERROR!', e);
    }
});

var PEG = require('../index.js');

var named = require('../named.js');
var ns = named.scope(sponsor);

/*
Assign <- Name "=" Assign
        / Expr
*/
ns.define('Assign',
    sponsor(PEG.choice([
        sponsor(PEG.sequence([
            ns.lookup('Name'),
            sponsor(PEG.terminal('=')),
            ns.lookup('Assign')
        ])),
        ns.lookup('Expr')
    ]))
);

/*
Name   <- [a-zA-Z]
*/
ns.define('Name',
    sponsor(PEG.predicate(function (token) {
        return /[a-zA-Z]/.test(token);
    }))
);

/*
Expr   <- Term ([-+] Term)*
*/
ns.define('Expr',
    sponsor(PEG.sequence([
        ns.lookup('Term'),
        sponsor(PEG.zeroOrMore(
            sponsor(PEG.sequence([
                sponsor(PEG.predicate(function (token) {
                    return /[-+]/.test(token);
                })),
                ns.lookup('Term')
            ]))
        ))
    ]))
);

/*
Term   <- Factor ([/*] Factor)*
*/
ns.define('Term',
    sponsor(PEG.sequence([
        ns.lookup('Factor'),
        sponsor(PEG.zeroOrMore(
            sponsor(PEG.sequence([
                sponsor(PEG.predicate(function (token) {
                    return /[/*]/.test(token);
                })),
                ns.lookup('Factor')
            ]))
        ))
    ]))
);

/*
Factor <- "(" Assign ")"
        / Name
        / [0-9]+
*/
ns.define('Factor',
    sponsor(PEG.choice([
        sponsor(PEG.sequence([
            sponsor(PEG.terminal('(')),
            ns.lookup('Assign'),
            sponsor(PEG.terminal(')'))
        ])),
        ns.lookup('Name'),
        sponsor(PEG.oneOrMore(
            sponsor(PEG.predicate(function (token) {
                return /[0-9]/.test(token);
            }))
        ))
    ]))
);

var ok = sponsor(function okBeh(m) {
    console.log('OK:', JSON.stringify(m, null, '  '));
});
var fail = sponsor(function failBeh(m) {
    console.log('FAIL:', JSON.stringify(m, null, '  '));
});

var start = ns.lookup('Assign');
start({
    in: {
        source: 'x=y=10-2/3+4*5/(6-7)',
        offset: 0
    },
    ok: ok,
    fail: fail
});
