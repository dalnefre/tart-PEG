/*

input.js - actor-based input streams

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

var input = module.exports;

//var log = console.log;
var log = function () {};

var end = input.end = {
	next: function next(cust) {
		cust(end);
	}
};

var memo = input.memo = function memo(streamBeh) {
	var waiting = [];
	var result;
	var initBeh = function initBeh(cust) {
		var stream = this.sponsor(streamBeh);
		waiting.push(cust);
		this.behavior = waitBeh;
		stream(this.self);
	};
	var waitBeh = function waitBeh(msg) {
		if (typeof msg === 'function') {
			waiting.push(msg);
		} else {
			result = msg;
			for (var i = 0; i < waiting.length; ++i) {
				waiting[i](result);
			}
			waiting = null;  // release waiting list
			this.behavior = cacheBeh;
		}
	};
	var cacheBeh = function cacheBeh(cust) {
		cust(result);
	};
	return initBeh;
};

var arrayStream = input.arrayStream = function arrayStream(seq, pos) {
	pos = pos || 0;
	return input.memo(function streamBeh(cust) {
		var token = seq[pos];
		log('arrayStream:', pos, JSON.stringify(token));
		if (pos < seq.length) {
			cust({
				token: seq[pos],
				pos: pos,
				next: this.sponsor(arrayStream(seq, pos + 1))
			});
		} else {
			var end = {
				pos: pos
			};
			end.next = this.sponsor(function endBeh(cust) {
			    cust(end);
			});
			cust(end);
		}
	});
};

var stringStream = input.stringStream = function stringStream(seq, prev) {
    log('stringStream(seq, prev):', JSON.stringify(seq), prev);
	prev = prev || {
		row: 0,
		col: -1,
		pos: -1
	};
	return input.memo(function streamBeh(cust) {
    	log('stringStream.prev:', prev);
		var pos = prev.pos + 1;
		var row = prev.row;
		var col = prev.col + 1;
		var token = seq[pos];
		log('stringStream:', pos, JSON.stringify(token), row, col);
		if ((prev.token === '\n')
		||  ((prev.token === '\r') && (token !== '\n'))) {
			row += 1;
			col = 0;
		}
		if (token) {
			var curr = {
				token: token,
				row: row,
				col: col,
				pos: pos
			};
			curr.next = this.sponsor(stringStream(seq, curr));
        	log('stringStream.curr:', curr);
			cust(curr);
		} else {
			var end = {
				row: row,
				col: col,
				pos: pos
			};
			end.next = this.sponsor(function endBeh(cust) {
			    cust(end);
			});
        	log('stringStream.end:', end);
			cust(end);
		}
	});
};
