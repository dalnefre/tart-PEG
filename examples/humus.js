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

var parseTokens = function parseTokens(source) {
    var ns = require('./humusTokens.js').build(this.sponsor, log);
    require('./reduceTokens.js').transform(ns);

    var ok = this.sponsor(function okBeh(m) {
        log('OK:', JSON.stringify(m, null, '  '));
        var syntax = this.sponsor(parseSyntax);
        syntax(m.value);
    });
    var fail = this.sponsor(function failBeh(m) {
        console.log('FAIL:', JSON.stringify(m, null, '  '));
    });

    var start = ns.lookup('tokens');
    //var start = ns.lookup('humus');
    start({
        in: {
            source: source,
            offset: 0
        },
        ok: ok,
        fail: fail
    });
};

var parseSyntax = function parseSyntax(source) {
    var ns = require('./humusSyntax.js').build(this.sponsor, log);
//    require('./reduceSyntax.js').transform(ns);

    process.stdout.write('<TOKENS>\n');
    var list = source;
    for (var i = 0; i < list.length; ++i) {
        process.stdout.write(JSON.stringify(list[i]) + '\n');
    }
    process.stdout.write('</TOKENS>\n');
};

var helloSource = 
    'SEND (#Hello, "World", \'\\n\', ##, -16#2a) TO println\n';
var labelSource = 
    'LET label_beh(cust, label) = \\msg.[ SEND (label, msg) TO cust ]\n'
  + 'CREATE R WITH label_beh(println, #Right)\n'
  + 'CREATE L WITH label_beh(println, #Left)\n'
  + 'SEND #Hello TO R\n';
  + 'SEND #Hello TO L\n';
//var fileSource = require('fs').readFileSync('sample.hum', 'utf8');

var parser = sponsor(parseTokens);
parser(helloSource);

tracing.eventLoop({
/*
    log: function (effect) {
        console.log('DEBUG', effect);
    },
*/
    fail: function (e) {
        console.log('ERROR!', e);
    }
});
