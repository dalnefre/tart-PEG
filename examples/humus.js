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

var log = console.log;
//var log = function () {};

var tart = require('tart-tracing');
var tracing = tart.tracing();
var sponsor = tracing.sponsor;

var PEG = require('../PEG.js');
var input = require('../input.js');

var humusTokens = require('./humusTokens.js').build(sponsor/*, log*/);
require('./reduceTokens.js').transform(humusTokens);

var humusSyntax = require('./humusSyntax.js').build(sponsor/*, log*/);
require('./reduceSyntax.js').transform(humusSyntax);

var humusCode = require('./humusCode.js');

/*
var source = input.fromString(sponsor, 
//    'SEND (#Hello, "World", \'\\n\', ##, -16#2a) TO println\n'
//    'CREATE sink WITH \\_.[]\n'
//    'LET id = \\x.x'
//    'LET id(x) = x'
//    '(\\x.x)(42)'
    'LET ident_expr_beh(ident) = \\(cust, #eval, env).[ SEND env(ident) TO cust ]'
);
*/
/*
*/
var source = input.fromString(sponsor, 
    'LET label_beh(cust, label) = \\msg.[ SEND (label, msg) TO cust ]\n'
  + 'CREATE R WITH label_beh(println, #Right)\n'
  + 'CREATE L WITH label_beh(println, #Left)\n'
  + 'SEND #Hello TO R\n'
  + 'SEND #Hello TO L\n'
);
/*
var source = input.fromStream(sponsor, 
    require('fs').createReadStream('examples/sample.hum', {
        encoding: 'utf8'
    })
);
*/

var pattern = humusTokens.call('token');
var tokens = input.fromPEG(sponsor, source, pattern);

var start = sponsor(PEG.start(
    humusSyntax.call('humus'),
    sponsor(function okBeh(m) {
        console.log('Syntax OK:', JSON.stringify(m, null, '  '));
        var code = humusCode.humus(m);
        console.log('humusCode:', JSON.stringify(code, null, '  '));
    }),
    sponsor(function failBeh(m) {
        console.log('Syntax FAIL:', JSON.stringify(m, null, '  '));
    })
));

tokens(start);  // begin reading from token stream

require('../fixture.js').asyncRepeat(5,
    function eventLoop() {
        return tracing.eventLoop({
//            count: 10000,
//            log: function (effect) { console.log('DEBUG', effect); },
            fail: function (error) { console.log('FAIL!', error); }
        });
    }
);
