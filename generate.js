/*

generate.js - generate ASCII text representation of PEG grammar

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

var generate = module.exports;

var q = function quote(o) {
    return JSON.stringify(o);
}

var indentDepth = 0;
var indentWidth = 2;
var indentSpace = 
'                                                                ';
var indent = function indent() {
    return indentSpace.substring(0, indentDepth);
};

var textRule = function textRule(name, expr) {
    var s = '';

    s += 'ns.define(' + q(name) + ',\n';
    indentDepth += indentWidth;
    s += indent() + textExpression(expr) + '\n';
    indentDepth -= indentWidth;
    s += indent() + ');';
    
    return s;
};

var textExpression = function textExpression(list) {
    if (list.length == 1) {
        return textSequence(list[0]);
    }
    
    var s = '';
    var a = [];

    s += 'sponsor(PEG.choice([\n';
    indentDepth += indentWidth;
    for (var i = 0; i < list.length; ++i) {
        a[i] = textSequence(list[i]);
    }
    s += indent() + a.join(',\n' + indent()) + '\n';
    indentDepth -= indentWidth;
    s += indent() + ']))';
    
    return s;
};

var textSequence = function textSequence(list) {
    if (list.length == 1) {
        return textTerm(list[0]);
    }
    
    var s = '';
    var a = [];

    s += 'sponsor(PEG.sequence([\n';
    indentDepth += indentWidth;
    for (var i = 0; i < list.length; ++i) {
        a[i] = textTerm(list[i]);
    }
    s += indent() + a.join(',\n' + indent()) + '\n';
    indentDepth -= indentWidth;
    s += indent() + ']))';
    
    return s;
};

var textTerm = function textTerm(term) {
    if ((typeof term === 'object') && (term.length > 0)) {
        return textExpression(term);
    }

    var s = '';

    if (term.type === 'Name') {
        s += 'ns.lookup(' + q(term.ptrn) + ')';
    } else if (term.type === 'AND') {
        s += 'sponsor(PEG.follow(\n';
        indentDepth += indentWidth;
        s += indent() + textTerm(term.ptrn) + '\n';
        indentDepth -= indentWidth;
        s += indent() + '))';
    } else if (term.type === 'NOT') {
        s += 'sponsor(PEG.not(\n';
        indentDepth += indentWidth;
        s += indent() + textTerm(term.ptrn) + '\n';
        indentDepth -= indentWidth;
        s += indent() + '))';
    } else if (term.type === 'QUESTION') {
        s += 'sponsor(PEG.optional(\n';
        indentDepth += indentWidth;
        s += indent() + textTerm(term.ptrn) + '\n';
        indentDepth -= indentWidth;
        s += indent() + '))';
    } else if (term.type === 'STAR') {
        s += 'sponsor(PEG.star(\n';
        indentDepth += indentWidth;
        s += indent() + textTerm(term.ptrn) + '\n';
        indentDepth -= indentWidth;
        s += indent() + '))';
    } else if (term.type === 'PLUS') {
        s += 'sponsor(PEG.plus(\n';
        indentDepth += indentWidth;
        s += indent() + textTerm(term.ptrn) + '\n';
        indentDepth -= indentWidth;
        s += indent() + '))';
    } else if (term.type === 'DOT') {
        s += 'sponsor(PEG.dot)';
    } else {
        s += q(term);
    }
    
    return s;
};

/*
 * text(grammar[, indent]) - generate ASCII text representation of PEG grammar
 */
generate.text = function text(grammar, width) {
    indentWidth = width || indentWidth;
    var s = '';

    s += '/* Generated PEG grammar */\n';
    s += '"use strict";\n';
    s += 'var grammar = module.exports;\n';
    s += '\n';
    s += 'var PEG = require("./index.js");\n';
    s += 'var named = require("./named.js");\n';
    s += '\n';
    s += 'grammar.build = function build(sponsor) {\n';
    indentDepth += indentWidth;
    s += indent() + 'var ns = named.scope(sponsor);\n';
    s += '\n';
    
    for (var name in grammar) {
        if (grammar.hasOwnProperty(name)) {
            s += indent() + textRule(name, grammar[name]) + '\n\n';
        }
    }
    
    s += indent() + 'return ns;  // return grammar namespace\n';
    indentDepth -= indentWidth;
    s += '};\n';

    return s;
};
