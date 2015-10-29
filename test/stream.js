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

//var tart = require('tart-tracing');
var s = require('../stream.js');

var log = console.log;
//var log = function () {};

var test = module.exports = {};   

test['characters() reads individual characters'] = function (test) {
    test.expect(5);
//    var tracing = tart.tracing();
//    var sponsor = tracing.sponsor;

	var cr = s.characters();
	var ar = ['.', '\r', '\r', '\n', '\n', '!'];
	cr.on('readable', function onReadable() {
		var obj = cr.read();
		log('readable:', obj);
		test.equal(obj.value, ar[obj.pos]);
	});
    cr.write('.\r\r\n\n!');
    cr.write(null);

//    test.ok(tracing.eventLoop());
    test.done();
};

test['countRowCol() handles different line endings'] = function (test) {
    test.expect(20);

	var cr = s.characters();
	var rc = s.countRolCol();
	var ar = [
	    { value:'.', pos:0, row:0, col:0 }, 
	    { value:'\r', pos:1, row:0, col:1 }, 
	    { value:'\r', pos:2, row:1, col:0 }, 
	    { value:'\n', pos:3, row:1, col:1 }, 
	    { value:'\n', pos:4, row:2, col:0 }, 
	    { value:'!', pos:5, row:3, col:0 }
	];
	var i = 0;
	rc.on('readable', function onReadable() {
	    var expect = ar[i++];
		var actual = rc.read();
		log('readable:', expect, actual);
		test.equal(actual.value, expect.value);
		test.equal(actual.pos, expect.pos);
		test.equal(actual.row, expect.row);
		test.equal(actual.col, expect.col);
	});
	cr.pipe(rc);
    cr.write('.\r\r\n\n!');
    cr.write(null);

    test.done();
};
