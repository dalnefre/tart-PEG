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
    var options = options || {};
    var ruleNamed = {};
    var ruleStack = [];
    var log = options.log || console.log;
    var wrapper = options.wrapper || function wrapper(rule, name) {
        rule = sponsor(PEG.memoize(rule, name));
        rule = sponsor(checkRecursion(name, rule));
        return rule;
    };

    var setRule = function setRule(name, pattern) {
        var rule = sponsor(function ruleBeh(m) {
            log('rule:', name, m);
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
                    log('match:', name, match);
//                    log('match:', ruleStack, match);
                    ruleStack.pop();
                    m.ok(match);
                }),
                fail: this.sponsor(function failBeh(r) {
//                    log(' fail:', ruleStack);
                    ruleStack.pop();
                    m.fail(r);
                })
            });
        });
        ruleNamed[name] = wrapper(rule, name);
    };

    var getRule = function getRule(name) {
        // delay name lookup until rule is invoked
        return function callBeh(m) {
            var rule = ruleNamed[name];
            if (typeof rule !== 'function') {
                throw Error('Unknown rule: ' + name);
            }
            rule(m);
        };
    };
    
    var checkRecursion = function checkRecursionPtrn(name, rule, fail) {
        fail = fail || function recursionFail(m) {
            log('recursionFail:', name, m);
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

    return {
        checkRecursion: checkRecursion,
        define: setRule,
        lookup: getRule
    };
};
