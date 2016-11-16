/*

test.js - test script

The MIT License (MIT)

Copyright (c) 2016 Dale Schumacher

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

//var log = console.log;
var log = function () {};
var warn = console.log;

var tart = require('tart-tracing');
//var PEG = require('../PEG.js');
//var input = require('../input.js');
var hybrid = require('../humus/hybrid.js');

test['hybrid model defines create and send'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;

    test.strictEqual('function', typeof hybrid.create);
    test.strictEqual('function', typeof hybrid.send);

    require('../fixture.js').testEventLoop(test, 3, tracing.eventLoop, log);
};

var no_op = function beh(msg) {  // no-op actor behavior
    return {
        actors: [],
        events: [],
        behavior: undefined
    };
};

test['behavior returns actors, events, and optional behavior'] = function (test) {
    test.expect(4);
    
    var m = 'Hello!';
    var r = no_op(m);
    
    test.strictEqual('object', typeof r);
    test.ok(Array.isArray(r.actors));
    test.ok(Array.isArray(r.events));
    test.ok((r.behavior === undefined) || ('function' === typeof r.behavior));

    test.done();
};

test['create returns actor address'] = function (test) {
    test.expect(1);
    
    var a = hybrid.create(no_op);
    
    test.strictEqual('string', typeof a);

    test.done();
};

test['send returns message-event'] = function (test) {
    test.expect(3);
    
    var a = hybrid.create(no_op);
    var m = 'Hello!';
    var e = hybrid.send(a, m);
    
    test.strictEqual('object', typeof e);
    test.strictEqual(a, e.target);
    test.strictEqual(m, e.message);

    test.done();
};
