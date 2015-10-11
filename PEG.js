/*

index.js - "tart-PEG": Parsing Expression Grammar (PEG) tools (tart module)

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

var PEG = module.exports;

/*
THIS IS AN ALTERNATIVE IMPLEMENTATION OF THE PATTERNS IN 'index.js'
USING THE ACTOR-BASED INPUT STREAM API/PROTOCOL DEFINED IN 'input.js'

A location within a stream is represented with an object like this:
{
    token: <current token, if any>,
    pos: <0-based position in the stream>,
    row: <0-based line location (character streams only)>,
    col: <0-based position on the line (character streams only)>,
    next: <actor used to advance the stream>
}

PEG parsing actors expect a message with this format:
{
    input: { <input stream location> },
    ok: <success actor>,
    fail: <failure actor>
}

On success/failure the ok/fail actors expect a result message with this format:
{
    start: { <stream start location> },
    end: { <stream end location> },
    value: <semantic value, if any>
}

*/

var log = console.log;
//var log = function () {};
var defaultLog = log;

var error = function error(m, e) {
    console.log('error', e);
    m.fail({
        start: m.input,
        end: m.input,
        error: e
    });
};

PEG.fail = function failBeh(m) {
    log('failBeh:', m);
    m.fail({
        start: m.input,
        end: m.input
    });
};

PEG.empty = function emptyBeh(m) {
    log('emptyBeh:', m);
    m.ok({
        start: m.input,
        end: m.input,
        value: []
    });
};

PEG.predicate = function predicatePtrn(predicate) {
    return function predicateBeh(m) {
        log('predicateBeh:', m);
        try {
            var token = m.input.token;
            if (token !== undefined) {
                if (predicate(token)) {
                    m.input.next(this.sponsor(function readBeh(input) {
                        m.ok({
                            start: m.input,
                            end: input,
                            value: token
                        });
                    }));
                    return;
                }
            }
            PEG.fail(m);
        } catch (e) {
            error(m, e);
        }
    };
};

PEG.dot = PEG.anything = PEG.predicate(function isTrue(token) {
    return true;
});

PEG.terminal = function terminalPtrn(expect) {
    return PEG.predicate(function isEqual(actual) {
        return (expect == actual);
    });
}

PEG.not = function notPtrn(pattern) {
    return function notBeh(m) {
        log('notBeh:', m);
        try {
            var result = {
                start: m.input,
                end: m.input
            };
            pattern({
                input: m.input,
                ok: this.sponsor(function okBeh(r) {
                    m.fail(result);
                }),
                fail: this.sponsor(function failBeh(r) {
                    m.ok(result);
                })
            });
        } catch (e) {
            error(m, e);
        }
    };
};

PEG.follow = function followPtrn(pattern) {
    return function followBeh(m) {
        log('followBeh:', m);
        try {
            var result = {
                start: m.input,
                end: m.input
            };
            pattern({
                input: m.input,
                ok: this.sponsor(function okBeh(r) {
                    m.ok(result);
                }),
                fail: this.sponsor(function failBeh(r) {
                    m.fail(result);
                })
            });
        } catch (e) {
            error(m, e);
        }
    };
};

var andThen = function andPtrn(first, rest) {
    return function andBeh(m) {
        log('andBeh:', m);
        var failure = this.sponsor(function failBeh(r) {
//            log('failBeh:', r, m);
            m.fail({
                start: m.input,
                end: r.end
            });
        });
        var next = this.sponsor(function nextBeh(r) {
            log('nextBeh:', r, m);
            var success = this.sponsor(function okBeh(rr) {
//                log('okBeh:', rr, r, m);
                rr.value.unshift(r.value);  // mutate rr.value
                m.ok({
                    start: m.input,
                    end: rr.end,
                    value: rr.value
                });
            });
            rest({
                input: r.end,
                ok: success,
                fail: failure
            });
        });
        first({
            input: m.input,
            ok: next,
            fail: failure
        });
    };
};
PEG.sequence = function sequencePtrn(list) {
    return function sequenceBeh(m) {
        if (list.length > 0) {
            var pattern = list.shift();
            this.behavior = andThen(
                pattern,
                this.sponsor(PEG.sequence(list))
            );
        } else {
            this.behavior = PEG.empty;
        }
        this.self(m);
    };
};

var orElse = function orPtrn(first, rest) {
    return function orBeh(m) {
        log('orBeh:', m);
        var next = this.sponsor(function nextBeh(r) {
            log('nextBeh:', r, m);
            rest({
                input: m.input,
                ok: m.ok,
                fail: m.fail
            });
        });
        first({
            input: m.input,
            ok: m.ok,
            fail: next
        });
    };
};
PEG.choice = function choicePtrn(list) {
    return function choiceBeh(m) {
        if (list.length > 0) {
            var pattern = list.shift();
            this.behavior = orElse(
                pattern,
                this.sponsor(PEG.choice(list))
            );
        } else {
            this.behavior = PEG.fail;
        }
        this.self(m);
    };
};

PEG.star = PEG.zeroOrMore = function zeroOrMorePtrn(pattern) {
    return function zeroOrMoreBeh(m) {
        log('zeroOrMoreBeh:', m);
        var list = [];
        var more = this.sponsor(function moreBeh(r) {
            list.push(r.value);  // mutate list
            pattern({
                input: r.end,
                ok: more,
                fail: done
            });
        });
        var done = this.sponsor(function doneBeh(r) {
            m.ok({
                start: m.input,
                end: r.end,
                value: list
            });
        });
        pattern({
            input: m.input,
            ok: more,
            fail: done
        });
    };
};

PEG.plus = PEG.oneOrMore = function oneOrMorePtrn(pattern) {
    return function oneOrMoreBeh(m) {
        log('oneOrMoreBeh:', m);
        var list = [];
        var more = this.sponsor(function moreBeh(r) {
            list.push(r.value);  // mutate list
            pattern({
                input: r.end,
                ok: more,
                fail: done
            });
        });
        var done = this.sponsor(function doneBeh(r) {
            m.ok({
                start: m.input,
                end: r.end,
                value: list
            });
        });
        pattern({
            input: m.input,
            ok: more,
            fail: m.fail
        });
    };
};

PEG.question = PEG.optional = PEG.zeroOrOne = function zeroOrOnePtrn(pattern) {
    return function zeroOrOneBeh(m) {
        log('zeroOrOneBeh:', m);
        pattern({
            input: m.input,
            ok: this.sponsor(function oneBeh(r) {
                m.ok({
                    start: m.input,
                    end: r.end,
                    value: [ r.value ]
                });
            }),
            fail: this.sponsor(function zeroBeh(r) {
                m.ok({
                    start: m.input,
                    end: m.input,
                    value: []
                });
            })
        });
    };
};

PEG.object = function objectPtrn(expect) {
    return PEG.predicate(function matchObject(actual) {
        for (var name in expect) {
            if (expect.hasOwnProperty(name)) {
                if (expect[name] !== actual[name]) {
                    return false;
                }
            }
        }
        return true;
    });
}

PEG.memoize = PEG.packrat = function packratPtrn(pattern, name, log) {
    var results = [];
    name = name || '';
    log = log || defaultLog;
    return function packratBeh(m) {
        log('packratBeh:', name, m);
        try {
            var at = m.input.pos;
            var r = results[at];
            if (r) {
                log('used:', name, at, r);
                m.ok(r);
            } else {
                var memo = this.sponsor(function memo(r) {
                    results[at] = r;
                    log('memo:', name, at, r);
                    m.ok(r);
                });
                pattern({
                    input: m.input,
                    ok: memo,
                    fail: m.fail
                });
            }
        } catch (e) {
            error(m, e);
        }
    };
};

PEG.namespace = function namespace(log) {
    var ns = {};
    var ruleNamed = [];
    log = log || defaultLog;
    
    ns.define = function setRule(name, pattern) {
        if (ruleNamed[name]) {
            throw Error('Redefined rule: ' + name);
        }
        log('setRule:', name);
        ruleNamed[name] = {
            name: name,
            pattern: pattern,
            transform: function ruleValue(rule, value) {  // default transform
                return {
                    name: rule.name,
                    value: value
                };
            }
        };
    };
    
    ns.lookup = function getRule(name) {
        // delay name lookup until rule is invoked
        log('getRule:', name);
        return function callBeh(m) {
            log('callBeh:', name, m);
            var rule = ruleNamed[name];
            if (!rule) {
                throw Error('Undefined rule: ' + name);
            }
            this.behavior = ns.wrapper(rule);
            this.self(m);
        };
    };
    
    ns.transform = function setTransform(name, transform) {
        var rule = ruleNamed[name];
        if (!rule) {
            throw Error('Undefined rule: ' + name);
        }
        rule.transform = transform;
    };
    
    ns.transformWrapper = function transformWrapper(rule) {
        return function transformBeh(m) {
            log('transformBeh:', rule, m);
            rule.pattern({
                input: m.input,
                ok: this.sponsor(function okBeh(r) {
                    try {
                        r.value = rule.transform(rule, r.value);
                    } catch (e) {
                        r.value = undefined;
                        r.error = e;
                    }
                    m.ok(r);
                }),
                fail: this.sponsor(function failBeh(r) {
                    m.fail(r);
                })
            });
        };
    };

    var ruleStack = [];
    ns.stackingWrapper = function stackingWrapper(pattern, rule) {
        return function stackingBeh(m) {
            log('stackingBeh:', rule, m);
            ruleStack.push({
                name: rule.name,
                pos: m.input.pos
            });
            log('ruleStack.push:', ruleStack);
            pattern({
                input: m.input,
                ok: this.sponsor(function okBeh(r) {
                    ruleStack.pop();
                    log('ruleStack.ok:', ruleStack);
                    m.ok(r);
                }),
                fail: this.sponsor(function failBeh(r) {
                    ruleStack.pop();
                    log('ruleStack.fail:', ruleStack);
                    m.fail(r);
                })
            });
        };
    };

    ns.wrapper = function wrapRule(rule) {
        return function wrapBeh(m) {
            log('wrapBeh:', rule, m);
            var transform = this.sponsor(ns.transformWrapper(rule));
            var stacking = this.sponsor(ns.stackingWrapper(transform, rule));
            this.behavior = PEG.memoize(stacking, rule.name, log);
            this.self(m);
        }
    };

    return ns;
};

PEG.start = function start(pattern, ok, fail) {
    return function startBeh(s) {
        pattern({
            input: s,
            ok: ok,
            fail: fail
        });
    };
};
