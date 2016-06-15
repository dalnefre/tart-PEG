/*

humus.js - chained parser for the Actor language Humus

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

var log = console.log;
//var log = function () {};

var PEG = require('../PEG.js');
var input = require('../input.js');

var fromStream = input.fromStream = function fromStream(sponsor, source) {
    var s = require('./stream.js');
    var ws = source.pipe(s.characters());
    var rs = ws.pipe(s.countRowCol()); //ws;
    var next = input.fromReadable(sponsor, rs);
    return next;
};

var fromArray = input.fromArray = function fromArray(sponsor, source) {
    var next = sponsor(input.arrayStream(source));
    return next;
};

var humusTokens = require('./humusTokens.js').build(sponsor, log);
require('./reduceTokens.js').transform(humusTokens);

var humusSyntax = require('./humusSyntax.js').build(sponsor, log);
//require('./reduceSyntax.js').transform(humusSyntax);

/*
var source = input.fromString(sponsor, 
    'SEND (#Hello, "World", \'\\n\', ##, -16#2a) TO println\n'
);
var source = input.fromString(sponsor, 
    'LET label_beh(cust, label) = \\msg.[ SEND (label, msg) TO cust ]\n'
  + 'CREATE R WITH label_beh(println, #Right)\n'
  + 'CREATE L WITH label_beh(println, #Left)\n'
  + 'SEND #Hello TO R\n'
  + 'SEND #Hello TO L\n'
);
*/
var source = input.fromStream(sponsor, 
    require('fs').readFile('sample.hum', 'utf8')
);

var parseTokens = function parseTokens(source) {
    var start = humusTokens.call('tokens');
    start({
        input: source,
        ok: sponsor(function okBeh(m) {
            log('Tokens OK:', JSON.stringify(m, null, '  '));
            parseSyntax(m.value);
        }),
        fail: sponsor(function failBeh(m) {
            console.log('Tokens FAIL:', JSON.stringify(m, null, '  '));
        })
    });
};

var dumpTokens = function dumpTokens(list) {
    process.stdout.write('<TOKENS>\n');
    for (var i = 0; i < list.length; ++i) {
        process.stdout.write(JSON.stringify(list[i]) + '\n');
    }
    process.stdout.write('</TOKENS>\n');
};

var parseSyntax = function parseSyntax(tokens) {
    dumpTokens(tokens);
    var start = humusSyntax.call('humus');
    start({
        input: input.fromArray(sponsor, tokens),
        ok: sponsor(function failBeh(m) {
            console.log('Syntax FAIL:', JSON.stringify(m, null, '  '));
        }),
        fail: sponsor(function failBeh(m) {
            console.log('Syntax FAIL:', JSON.stringify(m, null, '  '));
        })
    });
};

parseTokens(source);

/*
var parseTokens = function parseTokens(source) {
    var ns = require('./humusTokens.js').build(this.sponsor, log);
    require('./reduceTokens.js').transform(ns);

    var ok = this.sponsor(function okBeh(m) {
        log('Tokens OK:', JSON.stringify(m, null, '  '));
        var syntax = this.sponsor(parseSyntax);
        syntax(m.value);
    });
    var fail = this.sponsor(function failBeh(m) {
        console.log('Tokens FAIL:', JSON.stringify(m, null, '  '));
    });

    var stream = sponsor(require('../input.js').stringStream(source));
    var start = sponsor(ns.lookup('tokens'));
    var matcher = sponsor(PEG.start(start, ok, fail));
    stream(matcher);
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

    var ok = this.sponsor(function okBeh(m) {
        console.log('Syntax OK:', JSON.stringify(m, null, '  '));
    });
    var fail = this.sponsor(function failBeh(m) {
        console.log('Syntax FAIL:', JSON.stringify(m, null, '  '));
    });

    var stream = sponsor(require('../input.js').arrayStream(source));
    var start = sponsor(ns.lookup('humus'));
    var matcher = sponsor(PEG.start(start, ok, fail));
    stream(matcher);
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
*/

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
