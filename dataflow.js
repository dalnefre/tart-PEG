/*

dataflow.js - actor-based single-assignment dataflow variable

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

var dataflow = module.exports;

//var defaultLog = console.log;
var defaultLog = function () {};

var factory = dataflow.factory = function factory(sponsor, log) {
    log = log || defaultLog;

    var saUnbound = (function () {
        var saUnboundBeh = function saUnboundBeh(m) {
            log('saUnbound'+this.self+':', m);
            if (typeof m === 'function') {  // m = customer
                this.behavior = saWaiting([m]);
            } else if (typeof m === 'object') {  // m = value
                this.behavior = saBound(m);
            } else {
                log(this.self+' IGNORED', typeof m);
            }
        };
        return function saUnbound() {
            return saUnboundBeh;  // reusable behavior function
        };
    })();
    var saWaiting = function saWaiting(list) {
        return function saWaitingBeh(m) {
            log('saWaiting'+this.self+':', m, list);
            if (typeof m === 'function') {  // m = customer
                list.push(m);
            } else if (typeof m === 'object') {  // m = value
                this.behavior = saBound(m);
                list.forEach(function (item, index, array) {
                    item(m);  // broadcast value
                });
                list = null;  // release waiting list
            } else {
                log(this.self+' IGNORED', typeof m);
            }
        };
    };
    var saBound = function saBound(value) {
        return function saBoundBeh(m) {
            log('saBound'+this.self+':', m, value);
            if (typeof m === 'function') {  // m = customer
                m(value);
            } else {
                log(this.self+' IGNORED', typeof m);
            }
        };
    };

    return {
        unbound: function unbound() {
            return sponsor(saUnbound());
        },
        waiting: function waiting(list) {
            return sponsor(saWaiting(list));
        },
        bound: function bound(value) {
            return sponsor(saBound(value));
        },
        log: log
    };
};
