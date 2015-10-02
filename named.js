/*

named.js - named parser rules

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

var named = module.exports;

var PEG = require('./index.js');

/*
 * scope(sponsor, options = {}) - construct an naming scope for parsing actors
 */
named.scope = function scope(sponsor, options) {
    var ruleNamed = {};
    var ruleStack = [];
    options = options || {};
    options.log = options.log || console.log;
    options.wrapper = options.wrapper || function wrapper(rule, name) {
        rule = sponsor(options.cacheResults(name, rule));
        rule = sponsor(options.checkRecursion(name, rule));
        return rule;
    };

    options.define = function setRule(name, pattern) {
        var rule = sponsor(function ruleBeh(m) {
            options.log('rule:', name, m);
            ruleStack.push({
                name: name,
                offset: m.in.offset
            });
            pattern({
                in: m.in,
                ok: this.sponsor(function okBeh(r) {
                    var match = {
                        in: r.in,
                        value: { rule:name, value:r.value }
                    };
                    options.log('match:', name, match);
//                    options.log('match:', ruleStack, match);
                    ruleStack.pop();
                    m.ok(match);
                }),
                fail: this.sponsor(function failBeh(r) {
//                    options.log(' fail:', ruleStack);
                    ruleStack.pop();
                    m.fail(r);
                })
            });
        });
        ruleNamed[name] = options.wrapper(rule, name);
    };

    options.lookup = function getRule(name) {
        // delay name lookup until rule is invoked
        return function callBeh(m) {
            var rule = ruleNamed[name];
            if (typeof rule !== 'function') {
                throw Error('Unknown rule: ' + name);
            }
            rule(m);
        };
    };
    
    options.cacheResults = options.cacheResults ||
    function cacheResults(name, rule) {
        return PEG.memoize(rule, name, options.log);
    };
    
    options.checkRecursion = options.checkRecursion ||
    function checkRecursion(name, rule, fail) {
        fail = fail || function recursionFail(m) {
            options.log('recursionFail:', name, m);
            m.fail({
                in: m.in,
                value: m.value
            });
        };
        return function checkRecursionBeh(m) {
            var i = ruleStack.length;
            while (i > 0) {
                i -= 1;
                if (ruleStack[i].offset < m.in.offset) {
                    break;  // safe!
                }
                if (ruleStack[i].name == name) {
                    return fail(m);
                }
            }
            rule(m);
        };
    };

    return options;
};
