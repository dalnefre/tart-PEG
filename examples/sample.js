/*

sample.js - a few sample parsers

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

var ok = sponsor(function(m) {
    console.log('ok:', m);
});
var fail = sponsor(function(m) {
    console.log('FAIL!', m);
});

var PEG = require('../index.js');

var grammar = {};
var nameRule = function nameRule(name, factory) {
    grammar[name] = sponsor(function namedBeh(m) {
        this.behavior = PEG.packratPtrn(factory(this.sponsor), name);
        this.self(m);
    });
};
var callRule = function callRule(name) {
    return grammar[name];
};

nameRule('EOF', function(sponsor) {
    return sponsor(PEG.notPtrn(
        sponsor(PEG.anythingBeh)
    ));
});
nameRule('EOL', function(sponsor) {
    return sponsor(PEG.choicePtrn([
        sponsor(PEG.terminalPtrn('\n')),
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.terminalPtrn('\r')),
            sponsor(PEG.zeroOrOnePtrn(
                sponsor(PEG.terminalPtrn('\n'))
            ))
        ]))
    ]));
});
nameRule('Space', function(sponsor) {
    return sponsor(PEG.predicatePtrn(function(token) {
        return /\s/.test(token);
    }));
});
nameRule('Comment', function(sponsor) {
    return sponsor(PEG.sequencePtrn([
        sponsor(PEG.terminalPtrn('#')),
        sponsor(PEG.zeroOrMorePtrn(
            sponsor(PEG.sequencePtrn([
                sponsor(PEG.notPtrn(
                    callRule('EOL')
                )),
                sponsor(PEG.anythingBeh)
            ]))
        ))
    ]));
});
nameRule('_', function(sponsor) {
    return sponsor(PEG.zeroOrMorePtrn(
        sponsor(PEG.choicePtrn([
            callRule('Space'),
            callRule('Comment')
        ]))
    ));
});

var input = {
    source: '\r\n# comment\n',
//    source: 'EOL <- "\n" | "\r" "\n"?\r\n',
    offset: 0
};

(callRule('_'))({
    in: input,
    ok: ok,
    fail: fail
});

tracing.eventLoop({
/*
    log: function (effect) {
        console.log('DEBUG', effect);
    },
*/
    fail: function (exception) {
        console.log('FAIL!', exception);
    }
});
