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
var input = require('../input.js');

//var log = console.log;
var log = function () {};

var test = module.exports = {};   

test['empty string returns end marker'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

	var cust = sponsor(function (r) {
		test.equal(0, r.pos);
		test.strictEqual(undefined, r.token);
	});

	var stream = sponsor(input.stringStream(''));
	stream(cust);
    
    test.ok(tracing.eventLoop({
/*
		log: function (effect) {
			console.log('DEBUG', effect);
		},
*/
		fail: function (e) {
			console.log('ERROR!', e);
		}
	}));
    test.done();
};

test['string stream counts lines'] = function (test) {
    test.expect(21);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

	var c0 = sponsor(function (r) {
		log('c0:', r);
		test.equal(0, r.pos);
		test.equal('\r', r.token);
		test.equal(0, r.row);
		test.equal(0, r.col);
		r.next(c1);
	});
	var c1 = sponsor(function (r) {
		log('c1:', r);
		test.equal(1, r.pos);
		test.equal('\n', r.token);
		test.equal(0, r.row);
		test.equal(1, r.col);
		r.next(c2);
	});
	var c2 = sponsor(function (r) {
		log('c2:', r);
		test.equal(2, r.pos);
		test.equal('\n', r.token);
		test.equal(1, r.row);
		test.equal(0, r.col);
		r.next(c3);
	});
	var c3 = sponsor(function (r) {
		log('c3:', r);
		test.equal(3, r.pos);
		test.equal('\r', r.token);
		test.equal(2, r.row);
		test.equal(0, r.col);
		r.next(c4);
	});
	var c4 = sponsor(function (r) {
		log('c4:', r);
		test.equal(4, r.pos);
		test.strictEqual(undefined, r.token);
		test.equal(3, r.row);
		test.equal(0, r.col);
	});

	var stream = sponsor(input.stringStream('\r\n\n\r'));
	stream(c0);
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['empty array returns end marker'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

	var cust = sponsor(function (r) {
		test.equal(0, r.pos);
		test.strictEqual(undefined, r.token);
	});

	var stream = sponsor(input.arrayStream([]));
	stream(cust);
    
    test.ok(tracing.eventLoop());
    test.done();
};

test['array stream handles many types'] = function (test) {
    test.expect(9);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

	var c0 = sponsor(function (r) {
		log('c0:', r);
		test.equal(0, r.pos);
		test.strictEqual(42, r.token);
		r.next(c1);
	});
	var c1 = sponsor(function (r) {
		log('c1:', r);
		test.equal(1, r.pos);
		test.strictEqual('foo', r.token);
		r.next(c2);
	});
	var c2 = sponsor(function (r) {
		log('c2:', r);
		test.equal(2, r.pos);
		test.strictEqual('object', typeof r.token);
		r.next(c3);
	});
	var c3 = sponsor(function (r) {
		log('c3:', r);
		test.equal(3, r.pos);
		test.strictEqual(undefined, r.token);
	});

	var stream = sponsor(input.arrayStream([
		42,
		'foo',
		{}
	]));
	stream(c0);
    
    test.ok(tracing.eventLoop());
    test.done();
};
