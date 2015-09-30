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
        c = escChars[c];  // FIXME: handle unicode escapes!
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

var simpleSource = 
    '\r\n# comment\n';
var commentSource = 
    'Comment <- [#] (!EOL .)* EOL\r'
  + "EOL <- '\\n'\n" 
  + '     / "\\r" "\\n"?\r\n';
var exprSource =
    'Assign <- Name "=" Assign\n'
  + '        / Expr\n'
  + 'Name   <- [a-zA-Z]\n'
  + 'Expr   <- Term ([-+] Term)*\n'
  + 'Term   <- Factor ([/*] Factor)*\n'
  + 'Factor <- "(" Expr ")"\n'
  + '        / [0-9]+\n';
var input = {
    source: exprSource,
    offset: 0
};

var ns = require('../grammar.js').build(sponsor);

//var start = ns.lookup('_');
var start = ns.lookup('Grammar');
start({
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
