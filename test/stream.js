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
	var ar = Array('.', '\r', '\r', '\n', '!');
	cr.on('readable', function onReadable() {
		var obj = cr.read();
		log('readable:', obj);
		test.equal(obj.value, ar[obj.pos]);
	});
    cr.write('.\r\r\n!');
    cr.write(null);

//    test.ok(tracing.eventLoop());
    test.done();
};
