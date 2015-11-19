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

//var log = console.log;
var log = function () {};
var defaultLog = log;

var error = function error(m, e) {
    m.fail({
        in: m.in,
        value: m.value,
        error: e
    });
};

PEG.fail = function failBeh(m) {
    m.fail({
        in: m.in,
        value: m.value
    });
};

PEG.empty = function emptyBeh(m) {
    try {
        m.ok({
            in: m.in,
            value: []
        });
    } catch (e) {
        error(m, e);
    }
};

PEG.predicate = function predicatePtrn(predicate) {
    return function predicateBeh(m) {
        try {
            if (m.in.offset < m.in.source.length) {
                var token = m.in.source[m.in.offset];
                if (predicate(token)) {
                    return m.ok({
                        in: {
                            source: m.in.source,
                            offset: (m.in.offset + 1)
                        },
                        value: token
                    });
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
            var success = this.sponsor(function(r) {
                m.ok({
                    in: m.in,
                    value: m.value
                });
            });
            pattern({
                in: m.in,
                ok: m.fail,
                fail: success
            });
        } catch (e) {
            error(m, e);
        }
    };
};

PEG.follow = function followPtrn(pattern) {
    return function followBeh(m) {
        try {
            var success = this.sponsor(function(r) {
                m.ok({
                    in: m.in,
                    value: m.value
                });
            });
            pattern({
                in: m.in,
                ok: success,
                fail: m.fail
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
                in: r.in,
                ok: more,
                fail: done
            });
        });
        var done = this.sponsor(function doneBeh(r) {
            m.ok({
                in: r.in,
                value: list
            });
        });
        pattern({
            in: m.in,
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
                in: r.in,
                ok: more,
                fail: done
            });
        });
        var done = this.sponsor(function doneBeh(r) {
            m.ok({
                in: r.in,
                value: list
            });
        });
        pattern({
            in: m.in,
            ok: more,
            fail: m.fail
        });
    };
};

PEG.question = PEG.optional = PEG.zeroOrOne = function zeroOrOnePtrn(pattern) {
    return function zeroOrOneBeh(m) {
        pattern({
            in: m.in,
            ok: this.sponsor(function oneBeh(r) {
                m.ok({
                    in: r.in,
                    value: [ r.value ]
                });
            }),
            fail: this.sponsor(function zeroBeh(r) {
                m.ok({
                    in: m.in,
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
        var at = m.in.offset;
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
                in: m.in,
                ok: memo,
                fail: m.fail
            });
        }
    };
};

PEG.factory = function factory(sponsor) {
    var kit = {
        fail: sponsor(PEG.fail),
        empty: sponsor(PEG.empty)
    };
    kit.dot = kit.any = kit.anything = sponsor(PEG.anything);
    kit.term = kit.terminal = function aTerminal(token) {
        return sponsor(PEG.terminal(token));
    };
    kit.if = kit.cond = kit.predicate = function aPredicate(predicate) {
        return sponsor(PEG.predicate(predicate));
    };
    kit.not = function aNot(pattern) {
        return sponsor(PEG.not(pattern));
    };
    kit.follow = function aFollow(pattern) {
        return sponsor(PEG.follow(pattern));
    };
    kit.seq = kit.sequence = function aSequence(list) {
        return sponsor(PEG.sequence(list));
    };
    kit.alt = kit.choice = function aChoice(list) {
        return sponsor(PEG.choice(list));
    };
    kit.star = kit.zeroOrMore = function aZeroOrMore(pattern) {
        return sponsor(PEG.zeroOrMore(pattern));
    };
    kit.plus = kit.oneOrMore = function aOneOrMore(pattern) {
        return sponsor(PEG.oneOrMore(pattern));
    };
    kit.opt = kit.optional = kit.question = kit.zeroOrOne = function aZeroOrOne(pattern) {
        return sponsor(PEG.zeroOrOne(pattern));
    };
    kit.like = kit.object = function anObject(expect) {
        return sponsor(PEG.object(expect));
    };
    kit.memo = kit.memoize = kit.packrat = function aPackrat(pattern, name, log) {
        return sponsor(PEG.packrat(pattern, name, log));
    };
    return kit;
};
