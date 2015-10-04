/*

sample.js - building on the PEG ASCII grammar

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

//var PEG = require('./index.js');
//var named = require('./named.js');

/*
 * transform(ns) - augment grammar namespace with reduction semantics
 */
semantic.transform = function transform(ns) {
//    var log = console.log;
    var log = function () {};

    ns.transform('Grammar', function transformGrammar(name, value) {
        log('transformGrammar:', name, value);
        var list = value[1];
        var map = {};
        for (var i = 0; i < list.length; ++i) {
            var rule = list[i];
            if (rule.type === 'Rule') {
                map[rule.name] = rule.expr;
            }
        }
        log('Grammar:', map);
        return map;
    });

    ns.transform('Rule', function transformRule(name, value) {
        log('transformRule:', name, value);
        var rule = {
            type: name,
            name: value[0].ptrn,
            expr: value[2]
        };
        log('Rule:', rule);
        return rule;
    });

    ns.transform('Expression', function transformExpression(name, value) {
        log('transformExpression:', name, value);
        var first = value[0];
        var rest = value[1];
        var list = [];
        list.push(first);
        for (var i = 0; i < rest.length; ++i) {
            var next = rest[i];
            if (next[0] === 'SLASH') {
                list.push(next[1]);
            }
        }
        log('Expression:', list);
        return list;
    });

    ns.transform('Sequence', function transformSequence(name, value) {
        log('transformSequence:', name, value);
        log('Sequence:', value);
        return value;
    });

    ns.transform('Prefix', function transformPrefix(name, value) {
        log('transformPrefix:', name, value);
        var prefix = value[0];
        var suffix = value[1];
        if (prefix.length == 1) {
            return {
                type: prefix[0],
                ptrn: suffix
            };
        } else {
            return suffix;
        }
    });

    ns.transform('Suffix', function transformSuffix(name, value) {
        log('transformSuffix:', name, value);
        var primary = value[0];
        var suffix = value[1];
        if (suffix.length == 1) {
            return {
                type: suffix[0],
                ptrn: primary
            };
        } else {
            return primary;
        }
    });

    ns.transform('Primary', function transformPrimary(name, value) {
        log('transformPrimary:', name, value);
        if (value.length > 1) {
            if (value[0].type === 'Name') {
                return value[0];
            } else {
                return value[1];
            }
        } else {
            return value;
        }
    });

    ns.transform('Name', function transformName(name, value) {
        var s = value[0];
        var list = value[1];
        for (var i = 0; i < list.length; ++i) {
            s += list[i];
        }
        return {
            type: name,
            ptrn: s
        };
    });

    var transformString = function transformString(name, value) {
        var list = value[1];
        var s = [];
        for (var i = 0; i < list.length; ++i) {
            s.push(list[i][1]);
        }
        return {
            type: name,
            ptrn: s
        };
    };
    ns.transform('Literal', transformString);
    ns.transform('Class', transformString);

    ns.transform('Range', function transformRange(name, value) {
        if (value.length == 3) {
            return [
                value[0],
                value[2]
            ]
        } else {
            return value;
        }
    });

    var escChars = {
        'n': '\n'.charCodeAt(0),
        'r': '\r'.charCodeAt(0),
        't': '\t'.charCodeAt(0),
        "'": "'".charCodeAt(0),
        '"': '"'.charCodeAt(0),
        '[': '['.charCodeAt(0),
        ']': ']'.charCodeAt(0),
        '\\': '\\'.charCodeAt(0)
    };
    ns.transform('Character', function transformCharacter(name, value) {
        var c = value[1];
        if (value[0] === '\\') {
            c = escChars[c];  // FIXME: handle unicode escapes!
        } else {
            c = c.charCodeAt(0);
        }
        return c;
    });

    var transformToken = function transformToken(name, value) {
        return name;
    };
    ns.transform('LEFTARROW', transformToken);
    ns.transform('SLASH', transformToken);
    ns.transform('AND', transformToken);
    ns.transform('NOT', transformToken);
    ns.transform('QUESTION', transformToken);
    ns.transform('STAR', transformToken);
    ns.transform('PLUS', transformToken);
    ns.transform('OPEN', transformToken);
    ns.transform('CLOSE', transformToken);

    ns.transform('DOT', function transformDOT(name, value) {
        return { type: 'DOT' };
    });

    ns.transform('_', function transformSpace(name, value) {
        return ' ';
    });

    return ns;
};