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
//var PEG = require('../index.js');
var PEG = require('../PEG.js');
var input = require('../input.js');

var log = console.log;
//var log = function () {};

test['empty pattern returns empty list'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var start = sponsor(PEG.empty);

    var ok = sponsor(function (r) {
        log('OK:', JSON.stringify(r, null, 2));
        test.equal(0, r.value.length);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

	var matcher = sponsor(PEG.start(start, ok, fail));
	var stream = sponsor(input.stringStream(''));
	stream(matcher);
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['anything fails on end-of-input'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var start = sponsor(PEG.anything);

    var ok = sponsor(function (r) {
        console.log('OK:', JSON.stringify(r, null, 2));
    });
    var fail = sponsor(function (r) {
        log('FAIL:', JSON.stringify(r, null, 2));
        test.equal(0, r.end.pos);
    });

	var matcher = sponsor(PEG.start(start, ok, fail));
	var stream = sponsor(input.stringStream(''));
	stream(matcher);
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['terminal period matches period'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var start = sponsor(PEG.terminal('.'));

    var ok = sponsor(function (r) {
        log('OK:', JSON.stringify(r, null, 2));
        test.equal('.', r.value);
        test.equal(1, r.end.pos);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

	var matcher = sponsor(PEG.start(start, ok, fail));
	var stream = sponsor(input.stringStream('.'));
	stream(matcher);
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['terminal period fails on space'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var start = sponsor(PEG.terminal('.'));

    var ok = sponsor(function (r) {
        console.log('OK:', JSON.stringify(r, null, 2));
    });
    var fail = sponsor(function (r) {
        log('FAIL:', JSON.stringify(r, null, 2));
        test.equal(0, r.end.pos);
    });

	var matcher = sponsor(PEG.start(start, ok, fail));
	var stream = sponsor(input.stringStream(' '));
	stream(matcher);
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['not-anything matches end-of-input'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var start = sponsor(PEG.not(
        sponsor(PEG.anything)
    ));

    var ok = sponsor(function (r) {
        log('OK:', JSON.stringify(r, null, 2));
        test.equal(0, r.end.pos);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

	var matcher = sponsor(PEG.start(start, ok, fail));
	var stream = sponsor(input.stringStream(''));
	stream(matcher);
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['follow period matches without advancing'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var start = sponsor(PEG.follow(
        sponsor(PEG.terminal('.'))
    ));

    var ok = sponsor(function (r) {
        log('OK:', JSON.stringify(r, null, 2));
        test.equal(0, r.end.pos);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

	var matcher = sponsor(PEG.start(start, ok, fail));
	var stream = sponsor(input.stringStream('.'));
	stream(matcher);
    
    test.ok(tracing.eventLoop());
    test.done();
};

/*
test['empty sequence acts like empty pattern'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var start = sponsor(PEG.sequence([]));

    var ok = sponsor(function (r) {
        test.equal(0, r.value.length);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

    start({
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

test['sequence matches period + space 2x'] = function (test) {
    test.expect(5);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var period = sponsor(PEG.terminal('.'));
    var space = sponsor(PEG.predicate(function (token) {
        return /\s/.test(token);
    }));
    var start = sponsor(PEG.sequence([
        period,
        space,
        space
    ]));

    var ok = sponsor(function (r) {
        test.equal(3, r.value.length);
        test.equal('.', r.value[0]);
        test.equal('\r', r.value[1]);
        test.equal('\n', r.value[2]);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

    start({
        in: {
            source: '.\r\n',
            offset: 0
        },
        ok: ok,
        fail: fail
    });
    
    test.ok(tracing.eventLoop());
//    test.ok(tracing.eventLoop({
//        count: 100,
//        log: function (effect) {
//            console.log('DEBUG', effect);
//        },
//        fail: function (exception) {
//            console.log('FAIL!', exception);
//        }
//    }));
    test.done();
};

test['empty choice acts like fail pattern'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var start = sponsor(PEG.choice([]));

    var ok = sponsor(function (r) {
        console.log('OK:', JSON.stringify(r, null, 2));
    });
    var fail = sponsor(function (r) {
        test.equal(0, r.in.offset);
    });

    start({
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

    var plus = sponsor(PEG.terminal('+'));
    var minus = sponsor(PEG.terminal('-'));
    var start = sponsor(PEG.choice([
        plus,
        minus
    ]));

    var ok = sponsor(function (r) {
        test.equal('+', r.value);
        test.equal(1, r.in.offset);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

    start({
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

    var plus = sponsor(PEG.terminal('+'));
    var minus = sponsor(PEG.terminal('-'));
    var start = sponsor(PEG.choice([
        plus,
        minus
    ]));

    var ok = sponsor(function (r) {
        test.equal('-', r.value);
        test.equal(1, r.in.offset);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

    start({
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

    var plus = sponsor(PEG.terminal('+'));
    var minus = sponsor(PEG.terminal('-'));
    var start = sponsor(PEG.choice([
        plus,
        minus
    ]));

    var ok = sponsor(function (r) {
        console.log('OK:', JSON.stringify(r, null, 2));
    });
    var fail = sponsor(function (r) {
        test.equal(0, r.in.offset);
    });

    start({
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
*/

test['zeroOrMore matches nothing'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var space = sponsor(PEG.predicate(function (token) {
        return /\s/.test(token);
    }));
    var start = sponsor(PEG.zeroOrMore(space));

    var ok = sponsor(function (r) {
        log('OK:', JSON.stringify(r, null, 2));
        test.equal(0, r.value.length);
        test.equal(0, r.end.pos);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

	var matcher = sponsor(PEG.start(start, ok, fail));
	var stream = sponsor(input.stringStream('. \r\n'));
	stream(matcher);
    
    test.ok(tracing.eventLoop({ count: 100 }));
    test.done();
};

test['zeroOrMore matches single space'] = function (test) {
    test.expect(4);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var space = sponsor(PEG.predicate(function (token) {
        return /\s/.test(token);
    }));
    var start = sponsor(PEG.zeroOrMore(space));

    var ok = sponsor(function (r) {
        log('OK:', JSON.stringify(r, null, 2));
        test.equal(1, r.value.length);
        test.equal(' ', r.value[0]);
        test.equal(1, r.end.pos);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

	var matcher = sponsor(PEG.start(start, ok, fail));
	var stream = sponsor(input.stringStream(' '));
	stream(matcher);
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['zeroOrMore matches whitespace 3x'] = function (test) {
    test.expect(6);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var space = sponsor(PEG.predicate(function (token) {
        return /\s/.test(token);
    }));
    var start = sponsor(PEG.zeroOrMore(space));

    var ok = sponsor(function (r) {
        log('OK:', JSON.stringify(r, null, 2));
        test.equal(3, r.value.length);
        test.equal(' ', r.value[0]);
        test.equal('\r', r.value[1]);
        test.equal('\n', r.value[2]);
        test.equal(3, r.end.pos);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

	var matcher = sponsor(PEG.start(start, ok, fail));
	var stream = sponsor(input.stringStream(' \r\n.'));
	stream(matcher);
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['oneOrMore fails on nothing'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var space = sponsor(PEG.predicate(function (token) {
        return /\s/.test(token);
    }));
    var start = sponsor(PEG.oneOrMore(space));

    var ok = sponsor(function (r) {
        console.log('OK:', JSON.stringify(r, null, 2));
    });
    var fail = sponsor(function (r) {
        log('FAIL:', JSON.stringify(r, null, 2));
        test.equal(0, r.end.pos);
    });

	var matcher = sponsor(PEG.start(start, ok, fail));
	var stream = sponsor(input.stringStream('. \r\n'));
	stream(matcher);
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['oneOrMore matches single space'] = function (test) {
    test.expect(4);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var space = sponsor(PEG.predicate(function (token) {
        return /\s/.test(token);
    }));
    var start = sponsor(PEG.oneOrMore(space));

    var ok = sponsor(function (r) {
        log('OK:', JSON.stringify(r, null, 2));
        test.equal(1, r.value.length);
        test.equal(' ', r.value[0]);
        test.equal(1, r.end.pos);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

	var matcher = sponsor(PEG.start(start, ok, fail));
	var stream = sponsor(input.stringStream(' '));
	stream(matcher);
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['oneOrMore matches whitespace 3x'] = function (test) {
    test.expect(6);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var space = sponsor(PEG.predicate(function (token) {
        return /\s/.test(token);
    }));
    var start = sponsor(PEG.oneOrMore(space));

    var ok = sponsor(function (r) {
        log('OK:', JSON.stringify(r, null, 2));
        test.equal(3, r.value.length);
        test.equal(' ', r.value[0]);
        test.equal('\r', r.value[1]);
        test.equal('\n', r.value[2]);
        test.equal(3, r.end.pos);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

	var matcher = sponsor(PEG.start(start, ok, fail));
	var stream = sponsor(input.stringStream(' \r\n.'));
	stream(matcher);
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['zeroOrOne matches nothing'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var space = sponsor(PEG.predicate(function (token) {
        return /\s/.test(token);
    }));
    var start = sponsor(PEG.zeroOrOne(space));

    var ok = sponsor(function (r) {
        log('OK:', JSON.stringify(r, null, 2));
        test.equal(0, r.value.length);
        test.equal(0, r.end.pos);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

	var matcher = sponsor(PEG.start(start, ok, fail));
	var stream = sponsor(input.stringStream('. \r\n'));
	stream(matcher);
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['zeroOrOne matches single space'] = function (test) {
    test.expect(4);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    var space = sponsor(PEG.predicate(function (token) {
        return /\s/.test(token);
    }));
    var start = sponsor(PEG.zeroOrOne(space));

    var ok = sponsor(function (r) {
        log('OK:', JSON.stringify(r, null, 2));
        test.equal(1, r.value.length);
        test.equal(' ', r.value[0]);
        test.equal(1, r.end.pos);
    });
    var fail = sponsor(function (r) {
        console.log('FAIL:', JSON.stringify(r, null, 2));
    });

	var matcher = sponsor(PEG.start(start, ok, fail));
	var stream = sponsor(input.stringStream(' \r\n.'));
	stream(matcher);
    
    test.ok(tracing.eventLoop());
    test.done();
};
