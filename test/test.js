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

var tart = require('tart-tracing');
var PEG = require('../index.js');

var test = module.exports = {};   

test['empty pattern returns empty list'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var ok = sponsor(function(m) {
        test.equal(0, m.value.length);
    });
    var fail = sponsor(function(m) {
        console.log('FAIL!', m);
    });

    var empty = sponsor(PEG.emptyBeh);

    empty({
        in: {
            source: '',
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['anything fails on end-of-input'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var ok = sponsor(function(m) {
        console.log('ok:', m);
    });
    var fail = sponsor(function(m) {
        test.equal(0, m.in.offset);
    });

    var anything = sponsor(PEG.anythingBeh);

    anything({
        in: {
            source: '',
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['terminal period matches period'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var ok = sponsor(function(m) {
        test.equal('.', m.value);
        test.equal(1, m.in.offset);
    });
    var fail = sponsor(function(m) {
        console.log('FAIL!', m);
    });

    var period = sponsor(PEG.terminalPtrn('.'));

    period({
        in: {
            source: '.',
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['terminal period fails on space'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var ok = sponsor(function(m) {
        console.log('ok:', m);
    });
    var fail = sponsor(function(m) {
        test.equal(0, m.in.offset);
    });

    var period = sponsor(PEG.terminalPtrn('.'));

    period({
        in: {
            source: ' ',
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['not-anything matches end-of-input'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var ok = sponsor(function(m) {
        test.equal(0, m.in.offset);
    });
    var fail = sponsor(function(m) {
        console.log('FAIL!', m);
    });

    var anything = sponsor(PEG.anythingBeh);
    var end = sponsor(PEG.notPtrn(anything));

    end({
        in: {
            source: '',
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['follow period matches without advancing'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var ok = sponsor(function(m) {
        test.equal(0, m.in.offset);
    });
    var fail = sponsor(function(m) {
        console.log('FAIL!', m);
    });

    var period = sponsor(PEG.terminalPtrn('.'));
    var follow = sponsor(PEG.followPtrn(period));

    follow({
        in: {
            source: '.',
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['empty sequence acts like empty pattern'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var ok = sponsor(function(m) {
        test.equal(0, m.value.length);
    });
    var fail = sponsor(function(m) {
        console.log('FAIL!', m);
    });

    var empty = sponsor(PEG.sequencePtrn([]));

    empty({
        in: {
            source: ' ',
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['sequence matches period + spaces'] = function (test) {
    test.expect(5);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var ok = sponsor(function(m) {
        test.equal(3, m.value.length);
        test.equal('.', m.value[0]);
        test.equal('\r', m.value[1]);
        test.equal('\n', m.value[2]);
    });
    var fail = sponsor(function(m) {
        console.log('FAIL!', m);
    });

    var period = sponsor(PEG.terminalPtrn('.'));
    var space = sponsor(PEG.predicatePtrn(function(token) {
        return /\s/.test(token);
    }));
    var seq = sponsor(PEG.sequencePtrn([
        period,
        space,
        space
    ]));

    seq({
        in: {
            source: '.\r\n',
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop());
/*
    test.ok(tracing.eventLoop({
        log: function (effect) {
            console.log('DEBUG', effect);
        },
        fail: function (exception) {
            console.log('FAIL!', exception);
        }
    }));
*/
    test.done();
};

test['empty choice acts like fail pattern'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var ok = sponsor(function(m) {
        console.log('ok:', m);
    });
    var fail = sponsor(function(m) {
        test.equal(0, m.in.offset);
    });

    var empty = sponsor(PEG.choicePtrn([]));

    empty({
        in: {
            source: ' ',
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['plus/minus choice matches plus'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var ok = sponsor(function(m) {
        test.equal('+', m.value);
        test.equal(1, m.in.offset);
    });
    var fail = sponsor(function(m) {
        console.log('FAIL!', m);
    });

    var plus = sponsor(PEG.terminalPtrn('+'));
    var minus = sponsor(PEG.terminalPtrn('-'));
    var alt = sponsor(PEG.choicePtrn([
        plus,
        minus
    ]));

    alt({
        in: {
            source: '+',
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['plus/minus choice matches minus'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var ok = sponsor(function(m) {
        test.equal('-', m.value);
        test.equal(1, m.in.offset);
    });
    var fail = sponsor(function(m) {
        console.log('FAIL!', m);
    });

    var plus = sponsor(PEG.terminalPtrn('+'));
    var minus = sponsor(PEG.terminalPtrn('-'));
    var alt = sponsor(PEG.choicePtrn([
        plus,
        minus
    ]));

    alt({
        in: {
            source: '-',
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['plus/minus choice fails on star'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var ok = sponsor(function(m) {
        console.log('ok:', m);
    });
    var fail = sponsor(function(m) {
        test.equal(0, m.in.offset);
    });

    var plus = sponsor(PEG.terminalPtrn('+'));
    var minus = sponsor(PEG.terminalPtrn('-'));
    var alt = sponsor(PEG.choicePtrn([
        plus,
        minus
    ]));

    alt({
        in: {
            source: '*',
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['repeat matches nothing'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var ok = sponsor(function(m) {
        test.equal(0, m.value.length);
    });
    var fail = sponsor(function(m) {
        console.log('FAIL!', m);
    });

    var space = sponsor(PEG.predicatePtrn(function(token) {
        return /\s/.test(token);
    }));
    var whitespace = sponsor(PEG.repeatPtrn(space));

    whitespace({
        in: {
            source: '. \r\n',
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['repeat matches whitespace 3x'] = function (test) {
    test.expect(5);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var ok = sponsor(function(m) {
        test.equal(3, m.value.length);
        test.equal(' ', m.value[0]);
        test.equal('\r', m.value[1]);
        test.equal('\n', m.value[2]);
    });
    var fail = sponsor(function(m) {
        console.log('FAIL!', m);
    });

    var space = sponsor(PEG.predicatePtrn(function(token) {
        return /\s/.test(token);
    }));
    var whitespace = sponsor(PEG.repeatPtrn(space));

    whitespace({
        in: {
            source: ' \r\n.',
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop());
    test.done();
};
