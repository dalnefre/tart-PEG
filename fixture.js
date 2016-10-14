/*

fixture.js - fixtures to bridge between JS events and actor events

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

var fixture = module.exports;

//fixture.log = console.log;
fixture.log = function () {};

fixture.asyncRepeat = function asyncRepeat(n, action, callback) {
    callback = callback || function callback(error, result) {
        fixture.log('asyncRepeat callback:', error, result);
    };
    try {
        var result = action();
        fixture.log('asyncRepeat:', n, result);
        if (n > 1) {
            setImmediate(function () {
                fixture.asyncRepeat(n - 1, action, callback);
            });
        } else {
            callback(false, result);
        }
    } catch(ex) {
        callback(ex);
    }
};

fixture.testEventLoop = function testEventLoop(test, n, eventLoop, log) {
    log = log || fixture.log;
    fixture.asyncRepeat(n,
        function action() {
            return eventLoop({
              fail: function (error) { console.log('FAIL!', error); }
            });
        },
        function callback(error, result) {
            log('asyncRepeat('+n+'):', error, result);
            test.ok(!error && result);
            test.done();
        }
    );
};
