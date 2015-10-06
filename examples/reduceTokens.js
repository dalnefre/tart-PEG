/*

reduceToken.js - semantic transformation to simplify Humus tokens

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

var semantic = module.exports;

/*
 * transform(ns) - augment grammar namespace with reduction semantics
 */
semantic.transform = function transform(ns) {
//    var log = console.log;
    var log = function () {};

    ns.transform('tokens', function transformTokens(name, value) {
        log('transformTokens:', name, value);
        var result = value[1];
        log('Tokens:', result);
        return result;
    });

    var transformValue = function transformValue(name, value) {
        log('transformValue:', name, value);
        var result = value;
        log('Value:', result);
        return result;
    };
    ns.transform('token', transformValue);

    ns.transform('symbol', function transformSymbol(name, value) {
        log('transformSymbol:', name, value);
        var result = {
            type: name,
            value: value[1].value
        };
        log('Symbol:', result);
        return result;
    });

    ns.transform('number', function transformNumber(name, value) {
        log('transformNumber:', name, value);
        var result = {
            type: name
        };
        result.sign = value[0][0];
        result.radix = value[1].join('');
        if (value[2].length) {
            result.digits = value[2][0][1].join('');
            result.radix = parseInt(result.radix, 10);
        } else {
            result.digits = result.radix;
            result.radix = 10;
        }
        result.value = parseInt(result.digits, result.radix);
        if (result.sign == '-') {
            result.value = -(result.value);
        }
        log('Number:', result);
        return result;
    });

    ns.transform('char', function transformChar(name, value) {
        log('transformChar:', name, value);
        var result = {
            type: name,
            value: value[1][1]
        };
        log('Char:', result);
        return result;
    });

    ns.transform('string', function transformString(name, value) {
        log('transformString:', name, value);        
        var list = value[1];
        var s = '';
        for (var i = 0; i < list.length; ++i) {
            s += list[i][1];
        }
        var result = {
            type: name,
            value: s
        };
        log('String:', result);
        return result;
    });

    var escChars = {
        'n': '\n',
        'r': '\r',
        't': '\t',
        "'": "'",
        '"': '"',
        '[': '[',
        ']': ']',
        '\\': '\\'
    };
    ns.transform('qchar', function transformCharacter(name, value) {
        log('transformCharacter:', name, value);
        var result = value[1];
        if (value[0] === '\\') {
            result = escChars[result];  // FIXME: handle unicode escapes!
        }
        log('Character:', result);
        return result;
    });

    ns.transform('ident', transformValue);

    ns.transform('name', function transformName(name, value) {
        log('transformName:', name, value);
        var result = {
            type: name,
            value: value[0].join('')
        };
        log('Name:', result);
        return result;
    });

    ns.transform('punct', function transformPunct(name, value) {
        log('transformPunct:', name, value);
        var result = value[0];
        log('Punct:', result);
        return result;
    });

    var transformNamed = function transformNamed(name, value) {
        log('transformNamed:', name, value);
        var result = {
            type: name
        };
        log('Named:', result);
        return result;
    };
    ns.transform('IGNORE', transformNamed);
    ns.transform('LBRACK', transformNamed);
    ns.transform('RBRACK', transformNamed);
    ns.transform('COLON', transformNamed);
    ns.transform('COMMA', transformNamed);
    ns.transform('LPAREN', transformNamed);
    ns.transform('RPAREN', transformNamed);
    ns.transform('EQUAL', transformNamed);
    ns.transform('VALUE', transformNamed);
    ns.transform('LAMBDA', transformNamed);
    ns.transform('DOT', transformNamed);
    ns.transform('_', transformNamed);

    return ns;
};