/*

test.js - test script

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

var test = module.exports = {};   

var tart = require('tart-tracing');
var PEG = require('../PEG.js');
var input = require('../input.js');

var log = console.log;
//var log = function () {};

test['object sequence matches object-list source'] = function (test) {
    test.expect(6);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var pf = PEG.factory(sponsor);
    var ns = pf.namespace(log);
    ns.define('objects',
        pf.sequence([
            pf.object({ type:'name' }),
            pf.object({ type:'operator', value:'=' }),
            pf.object({ value:'42' })
        ])
    );

    var tokens = [
        { type:'name', value:'answer' },
        { type:'operator', value:'=' },
        { type:'number', value:'42' }
    ];
    var source = input.fromArray(sponsor, tokens);

    var ok = sponsor(function okBeh(r) {
        log('OK:', JSON.stringify(r, null, 2));
        var v = r.value;
        test.equal('objects', v.name);
        test.equal(3, v.value.length);
        test.equal('name', v.value[0].type);
        test.equal('operator', v.value[1].type);
        test.equal('number', v.value[2].type);
    });
    var fail = sponsor(function failBeh(r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

    var start = pf.start(
        ns.call('objects'),
        ok,
        fail
    );
    source(start);

    require('../fixture.js').asyncRepeat(3,
        function action() {
            return tracing.eventLoop({
//                count: 100,
//                log: function (effect) { console.log('DEBUG', effect); },
              fail: function (error) { console.log('FAIL!', error); }
            });
        },
        function callback(error, result) {
            log('asyncRepeat callback:', error, result);
            test.ok(!error && result);
            test.done();
        }
    );
};

test['input.fromPEG() unit test with mock source'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var pf = PEG.factory(sponsor);
    var ns = pf.namespace(log);

    /* input source consists of two tokens ['P', 'Q'] */
    var source = (function (sponsor) {
        var s0 = sponsor(function (cust) {
            log('s0:'+this.self+'', cust);
            if (typeof cust === 'function') {
                cust({
                    pos: 0,
                    value: 'P',
                    next: s1
                });
            }
        });
        var s1 = sponsor(function (cust) {
            log('s1'+this.self+':', cust);
            if (typeof cust === 'function') {
                cust({
                    pos: 1,
                    value: 'Q',
                    next: sZ
                });
            }
        });
        var sZ = sponsor(function (cust) {
            log('sZ'+this.self+':', cust);
            if (typeof cust === 'function') {
                cust({
                    end: true,
                    next: sZ
                });
            }
        });
        return s0;
    })(sponsor);

    var pattern = pf.any;  // match any single token, but not end-of-input

    var tokens = input.fromPEG(sponsor, source, pattern);

    var c_n = 0;  // expected position counter
    var cust = sponsor(function (r) {
//        log('cust'+this.self+' r:', JSON.stringify(r, null, 2));
        log('cust'+this.self+' r:', r);
        if (r.value !== undefined) {
            log('cust'+this.self+' n:', c_n);
            test.equal(c_n, r.pos);
            c_n += 1;  // update expected position
            r.next(cust);
        }
    });

    tokens(cust);  // begin reading from token stream

    require('../fixture.js').asyncRepeat(3,
        function action() {
            return tracing.eventLoop({
              fail: function (error) { console.log('FAIL!', error); }
            });
        },
        function callback(error, result) {
            log('asyncRepeat callback:', error, result);
            test.ok(!error && result);
            test.done();
        }
    );
};

test['PEG stream generates token objects'] = function (test) {
    test.expect(5);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var pf = PEG.factory(sponsor);
    var ns = pf.namespace(log);
/*
Token   <- Space* (!Space .)+
*/
    ns.define('Token',
        pf.seq([
            pf.star(
                ns.call('Space')
            ),
            pf.plus(
                pf.seq([
                    pf.not(
                        ns.call('Space')
                    ),
                    pf.any
                ])
            )
        ])
    );
/*
Space   <- [ \t-\r]
*/
    ns.define('Space',
        pf.if(function cond(token) {
            return /[ \t-\r]/.test(token);
        })
    );

//    var source = input.fromString(sponsor, 'This is a TEST!');
    var source = input.fromString(sponsor, 'X YZ');
    var pattern = ns.call('Token');
//    var pattern = pf.star(pf.any);  // _ <- .*
    var tokens = input.fromPEG(sponsor, source, pattern);

    var c_n = 0;  // expected position counter
    var cust = sponsor(function (r) {
//        log('cust'+this.self+' r:', JSON.stringify(r, null, 2));
        log('cust'+this.self+' r:', r);
        if (r.value !== undefined) {
            log('cust'+this.self+' n:', c_n);
            test.equal(c_n, r.pos);
            c_n += 1;  // update expected position
            r.next(cust);
        }
    });

    tokens(cust);  // begin reading from token stream
//    source(cust);
/*
    var ok = sponsor(function okBeh(r) {
        log('OK:', r);
        var v = r.value;
        log('OK.value:', JSON.stringify(v, null, 2));
        pattern({
            input: r.end,
            ok: ok,
            fail: fail
        });  // look for next match
    });
    var fail = sponsor(function failBeh(r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });
    var start = pf.start(
        pattern,
        ok,
        fail
    );
    source(start);
*/

    require('../fixture.js').asyncRepeat(3,
        function action() {
            return tracing.eventLoop({
              fail: function (error) { console.log('FAIL!', error); }
            });
        },
        function callback(error, result) {
            log('asyncRepeat callback:', error, result);
            test.ok(!error && result);
            test.done();
        }
    );
};

/*
    var pf = PEG.factory(sponsor);
    var ns = pf.namespace(log);
    ns.define('tokens',
        pf.star(
            pf.any
        )
    );
*/
