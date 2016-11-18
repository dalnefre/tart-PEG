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

var log = console.log;
//var log = function () {};
var warn = console.log;

//var tart = require('tart-tracing');
var actor = require('../humus/hybrid.js');

test['actor model defines create and send'] = function (test) {
    test.expect(2);

    test.strictEqual('function', typeof actor.create);
    test.strictEqual('function', typeof actor.send);

    test.done();
};

var null_beh = function null_beh(msg) {  // no-op actor behavior
    return {
        actors: [],
        events: [],
        behavior: undefined
    };
};

test['behavior returns actors, events, and optional behavior'] = function (test) {
    test.expect(4);
    
    var m = 'Hello!';
    var r = null_beh(m);
    log('r:', r);
    
    test.strictEqual('object', typeof r);
    test.ok(Array.isArray(r.actors));
    test.ok(Array.isArray(r.events));
    test.ok((r.behavior === undefined) || ('function' === typeof r.behavior));

    test.done();
};

test['create returns actor address'] = function (test) {
    test.expect(1);
    
    var a = actor.create(null_beh);
    
    test.strictEqual('function', typeof a);  // address encoded as a function

    test.done();
};

test['send returns message-event'] = function (test) {
    test.expect(3);
    
    var a = actor.create(null_beh);
    var m = 'Hello!';
    var e = actor.send(a, m);
    
    test.strictEqual('object', typeof e);
    test.strictEqual(a, e.target);
    test.strictEqual(m, e.message);

    test.done();
};

test['one shot actor should forward first message, then ignore everything'] = function (test) {
    test.expect(4);
    
    var null_beh = function null_beh(msg) {
        log('null:', msg, actor.self);
        test.strictEqual(2, ++count);
        return {
            actors: [],
            events: [],
            behavior: undefined
        };
    };
    var one_shot = function one_shot(fwd) {
        return function one_shot_beh(msg) {
            log('one_shot:', msg, actor.self);
            test.strictEqual(1, ++count);
            return {
                actors: [],
                events: [
                    actor.send(fwd, msg)
                ],
                behavior: null_beh
            };
        };
    };
    var done_beh = function done_beh(msg) {
        log('done:', msg, actor.self);
        test.done();
        return {
            actors: [],
            events: [],
            behavior: undefined
        };
    };
    
    var count = 0;
    var a = actor.create(function end_beh(msg) {
        log('end:', msg, actor.self);
        test.strictEqual(3, ++count);
        var d = actor.create(done_beh);
        return {
            actors: [d],
            events: [
                actor.send(d, 'Z')
            ],
            behavior: undefined
        };
    });
    var b = actor.create(one_shot(a));
    actor.apply({
        actors: [a, b],
        events: [
            actor.send(b, 'X'),
            actor.send(b, 'Y')
        ]
    });
    test.strictEqual(undefined, actor.self);
};
