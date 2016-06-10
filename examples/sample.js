/*

sample.js - sample usage of full PEG toolchain

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
/*
var tart = require('tart');
var sponsor = tart.minimal({
    fail: function (e) { console.log('ERROR!', e); }
});
*/

var log = console.log;
//var log = function () {};

var asyncRepeat = function asyncRepeat(n, action, callback) {
    callback = callback || function callback(error, result) {
        log('asyncRepeat callback:', error, result);
    };
    try {
        var result = action();
        log('asyncRepeat:', n, result);
        if (n > 1) {
            setImmediate(function () {
                asyncRepeat(n - 1, action, callback);
            });
        } else {
            callback(false, result);
        }
    } catch(ex) {
        callback(ex);
    }
};

var PEG = require('../PEG.js');

var ns = require('../grammar.js').build(sponsor, log);
require('../reducePEG.js').transform(ns);
/*
var pf = PEG.factory(sponsor);
var ns = pf.namespace(log);
ns.define('Grammar',
    pf.star(
        pf.any
    )
);
*/

var allSource = ''
+ 'ALL <- .*\n';
var simpleSource = ''
+ '\r\n# comment\n';
var objectSource = ''
+ 'IGNORE <- { type:\'name\', value:\'_\' }';
var stringSource = ''
+ 'STRING <- \'One\' "Two" Three [Four] [Five]+ [Six]*';
var commentSource = ''
+ 'Comment <- [#] (!EOL .)* EOL\r'
+ "EOL <- '\\n'\n" 
+ '     / "\\r" "\\n"?\r\n';
var exprSource = ''
+ 'Assign <- Name "=" Assign\n'
+ '        / Expr\n'
+ 'Name   <- [a-zA-Z]\n'
+ 'Expr   <- Term ([-+] Term)*\n'
+ 'Term   <- Factor ([/*] Factor)*\n'
+ 'Factor <- "(" Assign ")"\n'
+ '        / Name\n'
+ '        / [0-9]+\n';
var fileSource = require('fs').readFileSync('grammar.peg', 'utf8');
var source = fileSource; //allSource;

/*
var next = sponsor(
    require('../input.js').stringStream(source)
);
*/
/*
var stream = require('../stream.js').characters();
var next = require('../input.js').fromReadable(sponsor, stream);
stream.end(source);
*/
var next = require('../input.js').fromString(sponsor, source);

var ok = sponsor(function okBeh(m) {
    log('OK:', JSON.stringify(m, null, '  '));
    process.stdout.write(
        require('../generate.js').text(m.value, 2, source)
    );
});
var fail = sponsor(function failBeh(m) {
    console.log('FAIL:', JSON.stringify(m, null, '  '));
});

var start = sponsor(ns.lookup('Grammar'));
var matcher = sponsor(PEG.start(start, ok, fail));
next(matcher);

/*
tracing.eventLoop({
    fail: function (error) { console.log('FAIL!', error); }
});
*/
asyncRepeat(3,
    function eventLoop() {
        return tracing.eventLoop({
//            count: 10000,
//            log: function (effect) { console.log('DEBUG', effect); },
            fail: function (error) { console.log('FAIL!', error); }
        });
    }
);
