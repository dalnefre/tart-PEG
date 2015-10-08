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

OLD-STYLE PATTERNS USED A DIFFERENT API/PROTOCOL, AS SHOWN HERE...

PEG parsing actors expect a message with this format:
{
    in: {
        source: <token sequence>,
        offset: <0-based position in source>
    },
    ok: <success actor>,
    fail: <failure actor>
}

On success/failure the ok/fail actors expect a result message with this format:
{
    in: {
        source: <token sequence>,
        offset: <0-based position in source>
    },
    value: <semantic value, if any>
}

*/

//var log = console.log;
var log = function () {};
var defaultLog = log;

var error = function error(m, e) {
    m.fail({
        start: m.input,
        end: m.input,
        error: e
    });
};

PEG.fail = function failBeh(m) {
    m.fail({
        start: m.input,
        end: m.input
    });
};

PEG.empty = function emptyBeh(m) {
    m.ok({
        start: m.input,
        end: m.input,
        value: []
    });
};

PEG.predicate = function predicatePtrn(predicate) {
    return function predicateBeh(m) {
        try {
            var token = m.input.token;
            if (token !== undefined) {
                if (predicate(token)) {
                    m.input.next(sponsor(function readBeh(input) {
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
//        log('andBeh:', m);
        var failure = this.sponsor(function failBeh(r) {
//            log('failBeh:', r, m);
            m.fail({
                in: m.in,
                value: m.value
            });
        });
        var next = this.sponsor(function nextBeh(r) {
//            log('nextBeh:', r, m);
            var success = this.sponsor(function okBeh(rr) {
//                log('okBeh:', rr, r, m);
                rr.value.unshift(r.value);  // mutate rr.value
                m.ok({
                    in: rr.in,
                    value: rr.value,
                });
            });
            rest({
                in: r.in,
                ok: success,
                fail: failure
            });
        });
        first({
            in: m.in,
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
//        log('orBeh:', m);
        var next = this.sponsor(function nextBeh(r) {
//            log('nextBeh:', r, m);
            rest({
                in: m.in,
                ok: m.ok,
                fail: m.fail
            });
        });
        first({
            in: m.in,
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
