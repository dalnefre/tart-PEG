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

var error = function error(m, e) {
    m.fail({
        in: m.in,
        value: m.value,
        error: e
    });
};

PEG.fail = PEG.failBeh = function failBeh(m) {
    m.fail({
        in: m.in,
        value: m.value
    });
};

PEG.empty = PEG.emptyBeh = function emptyBeh(m) {
    try {
        m.ok({
            in: m.in,
            value: []
        });
    } catch (e) {
        error(m, e);
    }
};

PEG.predicate = PEG.predicatePtrn = function predicatePtrn(predicate) {
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

PEG.dot = PEG.anything = PEG.anythingBeh = PEG.predicate(function isTrue(token) {
    return true;
});

PEG.terminal = PEG.terminalPtrn = function terminalPtrn(expect) {
    return PEG.predicate(function isEqual(actual) {
        return (expect == actual);
    });
}

PEG.not = PEG.notPtrn = function notPtrn(pattern) {
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

PEG.follow = PEG.followPtrn = function followPtrn(pattern) {
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
//        console.log('andBeh:', m);
        var failure = this.sponsor(function failBeh(r) {
//            console.log('failBeh:', r, m);
            m.fail({
                in: m.in,
                value: m.value
            });
        });
        var next = this.sponsor(function nextBeh(r) {
//            console.log('nextBeh:', r, m);
            var success = this.sponsor(function okBeh(rr) {
//                console.log('okBeh:', rr, r, m);
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
PEG.sequence = PEG.sequencePtrn = function sequencePtrn(list) {
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
//        console.log('orBeh:', m);
        var next = this.sponsor(function nextBeh(r) {
//            console.log('nextBeh:', r, m);
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
PEG.choice = PEG.choicePtrn = function choicePtrn(list) {
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

PEG.star = PEG.zeroOrMore = PEG.zeroOrMorePtrn = function zeroOrMorePtrn(pattern) {
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

PEG.plus = PEG.oneOrMore = PEG.oneOrMorePtrn = function oneOrMorePtrn(pattern) {
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

PEG.question = PEG.optional = PEG.zeroOrOne = PEG.zeroOrOnePtrn = function zeroOrOnePtrn(pattern) {
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

PEG.memoize = PEG.packrat = PEG.packratPtrn = function packratPtrn(pattern, name, log) {
    var results = [];
    name = name || '';
    log = log || console.log;
    return function packratBeh(m) {
        var r = results[m.in.offset];
        if (r) {
            log('used:', name, r);
            m.ok(r);
        } else {
            var memo = this.sponsor(function memo(r) {
                results[m.in.offset] = r;
                log('memo:', name, r);
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
