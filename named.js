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
 * scope(sponsor) - construct an naming scope for parsing actors
 */
named.scope = function scope(sponsor) {
    var ruleNamed = {};
    var ruleStack = [];

    var setRule = function setRule(name, pattern) {
        var rule = sponsor(function ruleBeh(m) {
            console.log('rule:', name, m);
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
                    console.log('match:', name, match);
//                    console.log('match:', ruleStack, match);
                    ruleStack.pop();
                    m.ok(match);
                }),
                fail: this.sponsor(function failBeh(r) {
//                    console.log(' fail:', ruleStack);
                    ruleStack.pop();
                    m.fail(r);
                })
            });
        });
/*
*/
        rule = sponsor(
            PEG.packratPtrn(rule, name)
        );
        ruleNamed[name] = rule;
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
    return {
        define: setRule,
        lookup: getRule
    };
};
