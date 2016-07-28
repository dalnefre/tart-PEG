/*

reduceLISP.js - semantic transformation to simplify LISP tokens

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

var semantic = module.exports;

// var log = console.log;
var log = function () {};

/*
 * transform(ns) - augment grammar namespace with reduction semantics
 */
semantic.transform = function transform(ns) {
    /*
     * Extract just the result value (no name)
     */
    var transformValue = function transformValue(name, value) {
        log('transformValue:', name, value);
        var result = value;
        log('Value:', result);
        return result;
    };
    /*
     * Collapse value to an object with just the rule name
     */
    var transformNamed = function transformNamed(name, value) {
        log('transformNamed:', name, value);
        var result = {
            type: name
        };
        log('Named:', result);
        return result;
    };

    ns.transform('sexpr', function transformSexpr(name, value) {
        log('transformSexpr:', name, value);
        var result = value[1];
        log('Sexpr:', result);
        return result;
    });

    ns.transform('list', function transformList(name, value) {
        log('transformList:', name, value);
        var result = value[1];
        log('List:', result);
        return result;
    });

    ns.transform('atom', transformValue);

    ns.transform('number', function transformNumber(name, value) {
        log('transformNumber:', name, value);
        var result = parseInt(value.join(''), 10);
        log('Number:', result);
        return result;
    });

    ns.transform('symbol', function transformSymbol(name, value) {
        log('transformSymbol:', name, value);
        var result = value.join('');
        log('Symbol:', result);
        return result;
    });

    ns.transform('_', transformNamed);

    return ns;
};
