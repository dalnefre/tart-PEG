/*

hybrid.js - object/functional hybrid actor model

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

var actor = module.exports;

var log = console.log;
//var log = function () {};

var crypto = require('crypto');

var deepFreeze = function deepFreeze(obj) {  // make object immutable
    if ((obj === null) || (typeof obj !== 'object')) {
        return obj;
    }
    var propNames = Object.getOwnPropertyNames(obj);
    propNames.forEach(function (name) {  // Freeze properties before freezing self
        deepFreeze(obj[name]);
    });
    return Object.freeze(obj);  // Freeze self (no-op if already frozen)
};

var generateAddress = function generateAddress() {  // generate unique actor address string
    return crypto.randomBytes(42).toString('base64');
};

var newborn = {};  // address -> behavior map for newborn actors
var actors = {};  // address -> behavior map for established actors

actor.create = function create(behavior) {  // add new actor to behavior result
    if (typeof behavior !== 'function') {
        behavior = undefined;
    }
    var address = generateAddress();
    newborn[address] = behavior;
    log('create:', address);
    return address;
};

actor.send = function send(address, message) {  // add new message-event to behavior result
    var event = {
        target: address,
        message: message
    };
    log('send:', event);
    return deepFreeze(event);
};

actor.apply = function apply(result) {  // apply effects from stand-alone result (no 'self')
    result.actors.forEach(function (address) {  // new actors created
        var behavior = newborn[address];
        if (typeof behavior === 'function') {
            actors[address] = behavior;
        }
    });
    newborn = {};  // clear nursery
    result.events.forEach(function (event) {  // new message-events
        setImmediate(actor.dispatch, event);
    });
};

actor.dispatch = function dispatch(event) {  // deliver message-event
    try {
        log('dispatch:', event);
        actor.self = event.target;  // begin transaction
        var behavior = actors[actor.self];  // Find the behavior associated with the actor address
        var result = behavior(event.message);  // Invoke the behavior with the message as a parameter
        log('dispatch.result:', result);
        actor.apply(result);
        if (typeof result.behavior === 'function') {  // optional replacement behavior
            actors[actor.self] = result.behavior;
        }
    } catch (error) {
        log('dispatch.error:', error);
    } finally {
        actor.self = undefined;  // end transaction
    }
};
