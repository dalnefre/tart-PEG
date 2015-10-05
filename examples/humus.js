/*

humus.js - building on the PEG ASCII grammar

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

//var log = console.log;
var log = function () {};

//var ns = require('./humusSyntax.js').build(sponsor, log);
var ns = require('./humusTokens.js').build(sponsor, log);

require('./reduceTokens.js').transform(ns);

var helloSource = 
    'SEND (#Hello, "World", \'\\n\', ##, -16#2a) TO println\n';
var labelSource = 
    'LET label_beh(cust, label) = \\msg.[ SEND (label, msg) TO cust ]\n'
  + 'CREATE R WITH label_beh(println, #Right)\n'
  + 'CREATE L WITH label_beh(println, #Left)\n'
  + 'SEND #Hello TO R\n';
  + 'SEND #Hello TO L\n';
//var fileSource = require('fs').readFileSync('sample.hum', 'utf8');
var input = {
    source: helloSource,
    offset: 0
};

var ok = sponsor(function okBeh(m) {
    log('OK:', JSON.stringify(m, null, '  '));
    process.stdout.write('---- TOKENS ----\n');
    var list = m.value;
    for (var i = 0; i < list.length; ++i) {
        process.stdout.write(JSON.stringify(list[i]) + '\n');
    }
});
var fail = sponsor(function failBeh(m) {
    console.log('FAIL:', JSON.stringify(m, null, '  '));
});

var start = ns.lookup('tokens');
//var start = ns.lookup('humus');
start({
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
