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

var failException = function exception(m, e) {
    m.fail({
        in: m.in,
        value: m.value,
        error: e
    });
};

var failBeh = PEG.failBeh = function failBeh(m) {
    m.fail({
        in: m.in,
        value: m.value
    });
};

PEG.emptyBeh = function emptyBeh(m) {
    try {
        m.ok({
            in: m.in,
            value: []
        });
    } catch (e) {
        failException(m, e);
    }
};

PEG.predicatePtrn = function predicatePtrn(predicate) {
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
            failBeh(m);
        } catch (e) {
            failException(m, e);
        }
    };
};

PEG.anythingBeh = PEG.predicatePtrn(function isTrue(token) { return true; });

PEG.terminalPtrn = function terminalPtrn(expect) {
    return PEG.predicatePtrn(function isEqual(actual) {
        return (expect == actual);
    });
}
