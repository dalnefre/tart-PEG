/*

sample.js - a few sample parsers

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

var tart = require('tart-tracing');
var tracing = tart.tracing();
var sponsor = tracing.sponsor;

var ok = sponsor(function okBeh(m) {
    console.log('ok:', JSON.stringify(m, null, '  '));
    var value = visit(m.value);
    console.log('value:', JSON.stringify(value, null, '  '));
});
var fail = sponsor(function failBeh(m) {
    console.log('FAIL!', JSON.stringify(m, null, '  '));
});

var PEG = require('../index.js');

var actions = {};
var visit = function visit(node) {
    console.log('visit:', typeof(node), node);
    if (typeof node !== 'object') {
        return node;
    } else if (node.rule) {  // rule node
        var action = actions[node.rule];
        if (action) {
            node = action(node);
        } else {
            node.value = visit(node.value);
        }
    } else if (node.length) {  // list node
        for (var i = 0; i < node.length; ++i) {
            node[i] = visit(node[i]);
        }
    }
    return node;
};
var visitToken = function visitToken(node) {
    console.log('visitToken:', node);
    var token = node.rule;
    if (token === undefined) {
        token = node.value;
    }
    console.log('Token:', token);
    return token;
};

actions['Grammar'] = function visitGrammar(node) {
    console.log('visitGrammar:', node);
    var list = node.value[1];
    var map = {};
    for (var i = 0; i < list.length; ++i) {
        var rule = list[i];
        if (rule.rule === 'Rule') {
            var name = visit(rule.value[0]);
            var expr = visit(rule.value[2]);
            map[name] = expr;
        }
    }
    console.log('Grammar:', map);
    return map;
};
actions['Expression'] = function visitExpression(node) {
    console.log('visitExpression:', node);
    var first = node.value[0];
    var rest = node.value[1];
    var list = [];
    list.push(visit(first));
    for (var i = 0; i < rest.length; ++i) {
        var next = rest[i];
        if (next[0].rule === 'SLASH') {
            list.push(visit(next[1]));
        }
    }
    console.log('Expression:', list);
    return list;
};
actions['Sequence'] = function visitSequence(node) {
    console.log('visitSequence:', node);
    var list = visit(node.value);
    console.log('Sequence:', list);
    return list;
};
actions['Prefix'] = function visitPrefix(node) {
    console.log('visitPrefix:', node);
    var optn = node.value[0];
    var ptrn = visit(node.value[1]);
    if (optn.length === 1) {
        ptrn = {
            type: optn[0].rule,
            ptrn: ptrn
        };
    }
    console.log('Prefix:', ptrn);
    return ptrn;
};
actions['Suffix'] = function visitSuffix(node) {
    console.log('visitSuffix:', node);
    var ptrn = visit(node.value[0]);
    var optn = node.value[1];
    if (optn.length === 1) {
        ptrn = {
            type: optn[0].rule,
            ptrn: ptrn
        };
    }
    console.log('Suffix:', ptrn);
    return ptrn;
};
actions['Primary'] = function visitPrimary(node) {
    console.log('visitPrimary:', node);
    var ptrn = node.value;
    var rule = ptrn.rule;
    if (rule) {
        ptrn = visit(ptrn);
    } else {
        rule = ptrn[0].rule;
        if (rule === 'Name') {
            ptrn = visit(ptrn[0]);
        } else {
            ptrn = visit(ptrn[1]);
        }
    }
    console.log('Primary:', ptrn);
    return ptrn;
};
actions['Name'] = function visitName(node) {
    console.log('visitName:', node);
    var value = node.value;
    var name = value[0];
    var rest = value[1];
    for (var i = 0; i < rest.length; ++i) {
        name += rest[i];
    }
    console.log('Name:', name);
    return name;
};
actions['Literal'] = function visitLiteral(node) {
    console.log('visitLiteral:', node);
    var list = visit(node.value[1]);
    var s = [];
    for (var i = 0; i < list.length; ++i) {
        s.push(visit(list[i][1]));
    }
    var ptrn = {
        type: node.rule,
        ptrn: s
    };
    console.log('Literal:', ptrn);
    return ptrn;
};
actions['Class'] = function visitClass(node) {
    console.log('visitClass:', node);
    var list = visit(node.value[1]);
    var s = [];
    for (var i = 0; i < list.length; ++i) {
        s.push(visit(list[i][1]));
    }
    var ptrn = {
        type: node.rule,
        ptrn: s
    };
    console.log('Class:', ptrn);
    return ptrn;
};
actions['Range'] = function visitRange(node) {
    console.log('visitRange:', node);
    var r = node.value;
    if (r.rule === 'Character') {
        r = visit(r);
    } else {
        r = [
            visit(r[0]),
            visit(r[2])
        ];
    }
    console.log('Range:', r);
    return r;
};
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
actions['Character'] = function visitCharacter(node) {
    console.log('visitCharacter:', node);
    var c = node.value[1];
    if (node.value[0] === '\\') {
        c = escChars[c];
    } else {
        c = c.charCodeAt(0);
    }
    console.log('Character:', c);
    return c;
};
/*
actions['LEFTARROW'] = visitToken;
actions['SLASH'] = visitToken;
actions['AND'] = visitToken;
actions['NOT'] = visitToken;
actions['QUESTION'] = visitToken;
actions['STAR'] = visitToken;
actions['PLUS'] = visitToken;
actions['OPEN'] = visitToken;
actions['CLOSE'] = visitToken;
*/
actions['DOT'] = function visitDOT(node) {
    console.log('visitDOT:', node);
    var ptrn = {
        type: node.rule
    };
    console.log('DOT:', ptrn);
    return ptrn;
};
actions['_'] = function visit_(node) {  // optional whitespace
    console.log('visit_:', node);
    var space = ' ';
    console.log('_:', space);
    return space;
};

var grammar = {};
var ruleStack = [];
var nameRule = function nameRule(name, pattern) {
    var rule = sponsor(function ruleBeh(m) {
        console.log('rule:', name, m);
        ruleStack.push(name);
        pattern({
            in: m.in,
            ok: this.sponsor(function okBeh(r) {
                var match = {
                    in: r.in,
                    value: { rule:name, value:r.value }
                };
                console.log('match:', name, match);
//                console.log('match:', ruleStack, match);
                ruleStack.pop();
                m.ok(match);
            }),
            fail: this.sponsor(function failBeh(r) {
//                console.log(' fail:', ruleStack);
                ruleStack.pop();
                m.fail(r);
            })
        });
    });
    grammar[name] = rule;
/*
    grammar[name] = sponsor(
        PEG.packratPtrn(rule, name)
    );
*/
};
var callRule = function callRule(name) {
    // delay name lookup until rule is invoked
    return function callBeh(m) {
        var rule = grammar[name];
        if (typeof rule !== 'function') {
            throw Error('Unknown grammar rule: ' + name);
        }
        rule(m);
    };
};

nameRule('Grammar',
    sponsor(PEG.sequencePtrn([
        callRule('_'),
        sponsor(PEG.oneOrMorePtrn(
            callRule('Rule')
        )),
        callRule('EOF')
    ]))
);
nameRule('Rule',
    sponsor(PEG.sequencePtrn([
        callRule('Name'),
        callRule('LEFTARROW'),
        callRule('Expression')
    ]))
);
nameRule('Expression',
    sponsor(PEG.sequencePtrn([
        callRule('Sequence'),
        sponsor(PEG.zeroOrMorePtrn(
            sponsor(PEG.sequencePtrn([
                callRule('SLASH'),
                callRule('Sequence')
            ]))
        ))
    ]))
);
nameRule('Sequence',
    sponsor(PEG.zeroOrMorePtrn(
        callRule('Prefix')
    ))
);
nameRule('Prefix',
    sponsor(PEG.sequencePtrn([
        sponsor(PEG.zeroOrOnePtrn(
            sponsor(PEG.choicePtrn([
                callRule('AND'),
                callRule('NOT')
            ]))
        )),
        callRule('Suffix')
    ]))
);
nameRule('Suffix',
    sponsor(PEG.sequencePtrn([
        callRule('Primary'),
        sponsor(PEG.zeroOrOnePtrn(
            sponsor(PEG.choicePtrn([
                callRule('QUESTION'),
                callRule('STAR'),
                callRule('PLUS')
            ]))
        ))
    ]))
);
nameRule('Primary',
    sponsor(PEG.choicePtrn([
        sponsor(PEG.sequencePtrn([
            callRule('Name'),
            sponsor(PEG.notPtrn(
                callRule('LEFTARROW')
            ))
        ])),
        sponsor(PEG.sequencePtrn([
            callRule('OPEN'),
            callRule('Expression'),
            callRule('CLOSE')
        ])),
        callRule('Literal'),
        callRule('Class'),
        callRule('DOT')
    ]))
);

nameRule('Name',
    sponsor(PEG.sequencePtrn([
        sponsor(PEG.predicatePtrn(function(token) {
            return /[a-zA-Z_]/.test(token);
        })),
        sponsor(PEG.zeroOrMorePtrn(
            sponsor(PEG.predicatePtrn(function(token) {
                return /[a-zA-Z_0-9]/.test(token);
            }))
        )),
        callRule('_')
    ]))
);
nameRule('Literal',
    sponsor(PEG.choicePtrn([
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.terminalPtrn('"')),
            sponsor(PEG.oneOrMorePtrn(
                sponsor(PEG.sequencePtrn([
                    sponsor(PEG.notPtrn(
                        sponsor(PEG.terminalPtrn('"'))
                    )),
                    callRule('Character')
                ]))
            )),
            sponsor(PEG.terminalPtrn('"')),
            callRule('_')
        ])),
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.terminalPtrn("'")),
            sponsor(PEG.oneOrMorePtrn(
                sponsor(PEG.sequencePtrn([
                    sponsor(PEG.notPtrn(
                        sponsor(PEG.terminalPtrn("'"))
                    )),
                    callRule('Character')
                ]))
            )),
            sponsor(PEG.terminalPtrn("'")),
            callRule('_')
        ]))
    ]))
);
nameRule('Class',
    sponsor(PEG.sequencePtrn([
        sponsor(PEG.terminalPtrn('[')),
        sponsor(PEG.oneOrMorePtrn(
            sponsor(PEG.sequencePtrn([
                sponsor(PEG.notPtrn(
                    sponsor(PEG.terminalPtrn(']'))
                )),
                callRule('Range')
            ]))
        )),
        sponsor(PEG.terminalPtrn(']')),
        callRule('_')
    ]))
);
nameRule('Range',
    sponsor(PEG.choicePtrn([
        sponsor(PEG.sequencePtrn([
            callRule('Character'),
            sponsor(PEG.terminalPtrn('-')),
            callRule('Character')
        ])),
        callRule('Character')
    ]))
);
nameRule('Character',
    sponsor(PEG.choicePtrn([
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.terminalPtrn('\\')),
            sponsor(PEG.predicatePtrn(function(token) {
                return /[nrt'"[\]\\]/.test(token);
            }))
        ])),
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.terminalPtrn('\\')),
            sponsor(PEG.terminalPtrn('u')),
            sponsor(PEG.predicatePtrn(function(token) {
                return /[0-9a-fA-F]/.test(token);
            })),
            sponsor(PEG.predicatePtrn(function(token) {
                return /[0-9a-fA-F]/.test(token);
            })),
            sponsor(PEG.predicatePtrn(function(token) {
                return /[0-9a-fA-F]/.test(token);
            })),
            sponsor(PEG.predicatePtrn(function(token) {
                return /[0-9a-fA-F]/.test(token);
            }))
        ])),
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.notPtrn(
                sponsor(PEG.terminalPtrn('\\'))
            )),
            sponsor(PEG.anythingBeh)
        ]))
    ]))
);

nameRule('LEFTARROW',
    sponsor(PEG.sequencePtrn([
        sponsor(PEG.terminalPtrn('<')),
        sponsor(PEG.terminalPtrn('-')),
        callRule('_')
    ]))
);
nameRule('SLASH',
    sponsor(PEG.sequencePtrn([
        sponsor(PEG.terminalPtrn('/')),
        callRule('_')
    ]))
);
nameRule('AND',
    sponsor(PEG.sequencePtrn([
        sponsor(PEG.terminalPtrn('&')),
        callRule('_')
    ]))
);
nameRule('NOT',
    sponsor(PEG.sequencePtrn([
        sponsor(PEG.terminalPtrn('!')),
        callRule('_')
    ]))
);
nameRule('QUESTION',
    sponsor(PEG.sequencePtrn([
        sponsor(PEG.terminalPtrn('?')),
        callRule('_')
    ]))
);
nameRule('STAR',
    sponsor(PEG.sequencePtrn([
        sponsor(PEG.terminalPtrn('*')),
        callRule('_')
    ]))
);
nameRule('PLUS',
    sponsor(PEG.sequencePtrn([
        sponsor(PEG.terminalPtrn('+')),
        callRule('_')
    ]))
);
nameRule('OPEN',
    sponsor(PEG.sequencePtrn([
        sponsor(PEG.terminalPtrn('(')),
        callRule('_')
    ]))
);
nameRule('CLOSE',
    sponsor(PEG.sequencePtrn([
        sponsor(PEG.terminalPtrn(')')),
        callRule('_')
    ]))
);
nameRule('DOT',
    sponsor(PEG.sequencePtrn([
        sponsor(PEG.terminalPtrn('.')),
        callRule('_')
    ]))
);

nameRule('_',  // optional whitespace
    sponsor(PEG.zeroOrMorePtrn(
        sponsor(PEG.choicePtrn([
            callRule('Space'),
            callRule('Comment')
        ]))
    ))
);
nameRule('Comment',
    sponsor(PEG.sequencePtrn([
        sponsor(PEG.terminalPtrn('#')),
        sponsor(PEG.zeroOrMorePtrn(
            sponsor(PEG.sequencePtrn([
                sponsor(PEG.notPtrn(
                    callRule('EOL')
                )),
                sponsor(PEG.anythingBeh)
            ]))
        ))
    ]))
);
nameRule('Space',
    sponsor(PEG.predicatePtrn(function(token) {
        return /\s/.test(token);
    }))
);
nameRule('EOL',
    sponsor(PEG.choicePtrn([
        sponsor(PEG.terminalPtrn('\n')),
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.terminalPtrn('\r')),
            sponsor(PEG.zeroOrOnePtrn(
                sponsor(PEG.terminalPtrn('\n'))
            ))
        ]))
    ]))
);
nameRule('EOF',
    sponsor(PEG.notPtrn(
        sponsor(PEG.anythingBeh)
    ))
);

var input = {
//    source: '\r\n# comment\n',
    source: 'Comment <- [#] (!EOL .)* EOL\r'
          + "EOL <- '\\n'\n" 
          + '     / "\\r" "\\n"?\r\n',
    offset: 0
};

//(callRule('_'))({
(callRule('Grammar'))({
    in: input,
    ok: ok,
    fail: fail
});

tracing.eventLoop({
/*
    log: function (effect) {
        console.log('DEBUG', effect);
    },
*/
    fail: function (exception) {
        console.log('FAIL!', exception);
    }
});
