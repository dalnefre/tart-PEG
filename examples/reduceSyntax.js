/*

reduceSyntax.js - semantic transformation to simplify Humus tokens

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

var semantic = module.exports;

/*
 * transform(ns) - augment grammar namespace with reduction semantics
 */
semantic.transform = function transform(ns) {
//    var log = console.log;
    var log = function () {};
/*
name, value ==> { name: name, value: value, ... }
*/
    var transformDefault = function transformDefault(name, value, r) {
        log('transformDefault:', name, value, r);
        var result = {
            name: name,
            start: r.start,
            end: r.end,
            value: value
        };
        log('Default:', result);
        return result;
    };
/*
name, value ==> value
*/
    var transformValue = function transformValue(name, value) {
        log('transformValue:', name, value);
        var result = value;
        log('Value:', result);
        return result;
    };
/*
name, value ==> { type: name }
*/
    var transformNamed = function transformNamed(name, value) {
        log('transformNamed:', name, value);
        var result = {
            type: name
        };
        log('Named:', result);
        return result;
    };

/*
humus   <- stmt+
[stmt, ...] ==> [stmt, ...]
*/
    ns.transform('humus', transformValue);

/*
block   <- '[' stmt* ']'
['[', [stmt, ...], ']'] ==> { type: block, stmts: [stmt, ...] }
*/
    ns.transform('block', function transformBlock(name, value) {
        log('transformBlock:', name, value);
        var result = value;
        if ((value.length === 3) && (value[0] === '[') && (value[2] === ']')) {
            result = {
                type: 'block',
                stmts: value[1]
            };
        }
        log('Block:', result);
        return result;
    });

/*
stmt    <- 'LET' eqtn !'IN'
         / ('AFTER' expr)? 'SEND' expr 'TO' expr
         / 'CREATE' ident 'WITH' expr
         / 'BECOME' expr
         / 'THROW' expr
         / expr
['LET', equation, undefined] ==> { type: 'let', eqtn: equation }
[['AFTER', delay], 'SEND', message, 'TO', target] ==> { type: 'after_send', dt: delay, msg: message, to: target }
[[], 'SEND', message, 'TO', target] ==> { type: 'send', msg: message, to: target }
['CREATE', identifier, 'WITH', behavior] ==> { type: 'create', ident: identifier, expr: behavior }
['BECOME', behavior] ==> { type: 'become', expr: behavior }
['THROW', exception] ==> { type: 'throw', expr: exception }
expr ==> { type: 'expr', expr: value }
*/
    ns.transform('stmt', function transformStatement(name, value) {
        log('transformStatement:', name, value);
        var result = value;
        if ((value.length === 3) && (value[0] === 'LET')) {
            result = {
                type: 'let',
                eqtn: value[1]
            };
        } else if ((value.length === 5) && (value[0][0] === 'AFTER') && (value[1] === 'SEND') && (value[3] === 'TO')) {
            result = {
                type: 'after_send',
                dt: value[0][1],
                msg: value[2],
                to: value[4]
            };
        } else if ((value.length === 5) && (value[1] === 'SEND') && (value[3] === 'TO')) {
            result = {
                type: 'send',
                msg: value[2],
                to: value[4]
            };
        } else if ((value.length === 4) && (value[0] === 'CREATE') && (value[2] === 'WITH')) {
            result = {
                type: 'create',
                ident: value[1].value,  // extract actual identifier
                expr: value[3]
            };
        } else if ((value.length === 2) && (value[0] === 'BECOME')) {
            result = {
                type: 'become',
                expr: value[1]
            };
        } else if ((value.length === 2) && (value[0] === 'THROW')) {
            result = {
                type: 'throw',
                expr: value[1]
            };
        } else {
            result = {
                type: 'expr',
                expr: value
            };
        }
        log('Statement:', result);
        return result;
    });

/*
expr    <- 'LET' eqtn 'IN' expr
         / 'IF' eqtn expr ('ELIF' eqtn expr)* ('ELSE' expr)?
         / 'CASE' expr 'OF' (ptrn ':' expr)+ 'END'
         / term ',' expr
         / term
['LET', equation, 'IN', expression] ==> { type: 'let_in', eqtn: equation, expr: expression }
['IF', equation_0, consequent_0, [['ELIF', equation_n, consequent_n], ...], ['ELSE', alternative]] ==> { type: 'if', ... }
['CASE', expression, 'OF', [[ptrn, ':', result], ...], 'END'] ==> { type: 'case', ... }
[term, ',', more] ==> { type: 'pair', head: term, tail: more }
term ==> value
*/
    ns.transform('expr', function transformExpression(name, value) {
        log('transformExpression:', name, value);
        var result = value;
        if ((value.length === 4) && (value[0] === 'LET') && (value[2] === 'IN')) {
            result = {
                type: 'let_in',
                eqtn: value[1],
                expr: value[3]
            };
        } else if ((value.length === 5) && (value[0] === 'IF')) {
            var final = { type: 'const', value: undefined };
            if ((value[4].length == 2) && (value[4][0] === 'ELSE')) {
                final = value[4][1];
            }
            result = {
                type: 'if',
                eqtn: value[1],
                expr: value[2],
                next: final
            };
            var current = result;
            value[3].forEach(function (elif) {
                if ((elif.length === 3) && (elif[0] === 'ELIF')) {
                    current.next = {
                        type: 'if',
                        eqtn: elif[1],
                        expr: elif[2],
                        next: final
                    };
                    current = current.next;
                }
            });
        } else if ((value.length === 5) && (value[0] === 'CASE') && (value[2] === 'OF') && (value[4] === 'END')) {
            var final = { type: 'end' };
            result = {
                type: 'case',
                expr: value[1],
                next: final
            };
            var current = result;
            value[3].forEach(function (choice) {
                if ((choice.length === 3) && (choice[1] === ':')) {
                    current.next = {
                        type: 'choice',
                        ptrn: choice[0],
                        expr: choice[2],
                        next: final
                    };
                    current = current.next;
                }
            });
        } else if ((value.length === 3) && (value[1] === ',')) {
            result = {
                type: 'pair',
                head: value[0],
                tail: value[2]
            };
        }
        log('Expression:', result);
        return result;
    });

/*
term    <- 'NEW' term
         / const
         / call
         / '(' expr? ')'
         / ident
['NEW', term] ==> { type: 'new', expr: term }
{ type: 'const', ... } ==> value
{ type: 'call', ... } ==> value
['(', [], ')'] ==> { type: 'const', value: null }
['(', [expr], ')'] ==> expr
{ type: 'ident', value: name } ==> value
*/
    ns.transform('term', function transformTerm(name, value) {
        log('transformTerm:', name, value);
        var result = value;
        if ((value.length === 2) && (value[0] === 'NEW')) {
            result = {
                type: 'new',
                expr: value[1]
            };
        } else if ((value.length === 3) && (value[0] === '(') && (value[2] === ')')) {
            if (value[1].length < 1) {
                result = {
                    type: 'const',
                    value: null
                };
            } else {
                result = value[1][0];
            }
        }
        log('Term:', result);
        return result;
    });

/*
call    <- ident '(' expr? ')'
         / '(' expr ')' '(' expr? ')'
[ident, '(', [expr], ')'] ==> { type: 'app', abs: ident, arg: expr }
['(', abs, ')', '(', [expr], ')'] ==> { type: 'app', abs: abs, arg: expr }
*/
    ns.transform('call', function transformCall(name, value) {
        log('transformCall:', name, value);
        var result = {
            type: 'call'
        };
        var expr;
        if ((value.length === 4) && (value[1] === '(') && (value[3] === ')')) {
            result.abs = value[0];
            expr = value[2];
        } else if ((value.length === 6) && (value[0] === '(') && (value[2] === ')') && (value[3] === '(') && (value[5] === ')')) {
            result.abs = value[1];
            expr = value[4];
        }
        if (expr.length < 1) {
            result.arg = {
                type: 'const',
                value: null
            };
        } else {
            result.arg = expr[0];
        }
        log('Call:', result);
        return result;
    });

/*
eqtn    <- ident '(' ptrn? ')' '=' expr
         / ptrn '=' ptrn
[ident, '(', [ptrn], ')', '=', expr] ==> { type: 'eqtn', left: ident, right: { type: 'abs', ptrn: ptrn, body: expr } }
[lhs, '=', rhs] ==> { type: 'eqtn', left: lhs, right: rhs }
*/
    ns.transform('eqtn', function transformEquation(name, value) {
        log('transformEquation:', name, value);
        var result = value;
        if ((value.length === 6) && (value[1] === '(') && (value[3] === ')') && (value[4] === '=')) {
            if (value[2].length < 1) {  // extract pattern
                result = {
                    type: 'const',
                    value: null
                };
            } else {
                result = value[2][0];
            }
            result = {
                type: 'eqtn',
                left: value[0],
                right: {
                    type: 'abs',
                    ptrn: result,  // use pattern in equation rewrite
                    body: value[5]
                }
            };
        } else if ((value.length === 3) && (value[1] === '=')) {
            result = {
                type: 'eqtn',
                left: value[0],
                right: value[2]
            };
        }
        log('Equation:', result);
        return result;
    });

/*
ptrn    <- pterm ',' ptrn
         / pterm
[pterm, ',', more] ==> { type: 'pair', head: pterm, tail: more }
pterm ==> value
*/
    ns.transform('ptrn', function transformPattern(name, value) {
        log('transformPattern:', name, value);
        var result = value;
        if ((value.length === 3) && (value[1] === ',')) {
            result = {
                type: 'pair',
                head: value[0],
                tail: value[2]
            };
        }
        log('Pattern:', result);
        return result;
    });

/*
pterm   <- '_'
         / '$' term
         / '(' ptrn? ')'
         / const
         / ident
'_' ==> ? { type: 'any' }
['$', term] ==> { type: 'value', expr: term }
['(', [], ')'] ==> { type: 'const', value: null }
['(', [ptrn], ')'] ==> ptrn
{ type: 'const', ... } ==> value
{ type: 'ident', value: name } ==> value
*/
    ns.transform('pterm', function transformPTerm(name, value) {
        log('transformPTerm:', name, value);
        var result = value;
        if (value === '_') {
            result = {
                type: 'any'
            };
        } else if ((value.length === 2) && (value[0] === '$')) {
            result = {
                type: 'value',
                expr: value[1]
            };
        } else if ((value.length === 3) && (value[0] === '(') && (value[2] === ')')) {
            if (value[1].length < 1) {
                result = {
                    type: 'const',
                    value: null
                };
            } else {
                result = value[1][0];
            }
        }
        log('PTerm:', result);
        return result;
    });

/*
const   <- block
         / 'SELF'
         / '\\' ptrn '.' expr
         / symbol
         / number
         / char
         / string
         / 'NIL'
         / 'TRUE'
         / 'FALSE'
         / '?'
{ type: block, ... } ==> value
'SELF' ==> { type: 'self' }
['\\', ptrn, '.', body] ==> { type: 'abs', ptrn: ptrn, body: expr }
{ type: symbol, ... } ==> value
{ type: number, ... } ==> value
{ type: char, ... } ==> value
{ type: string, ... } ==> value
'NIL' ==> { type: 'const', value: null }
'TRUE' ==> { type: 'const', value: true }
'FALSE' ==> { type: 'const', value: false }
'?' ==> { type: 'const', value: undefined }
*/
    ns.transform('const', function transformConstant(name, value) {
        log('transformConstant:', name, value);
        var result = value;
        if (value === 'SELF') {
            result = {
                type: 'self'
            };
        } else if ((value.length === 4) && (value[0] === '\\') && (value[2] === '.')) {
            result = {
                type: 'abs',
                ptrn: value[1],
                body: value[3]
            };
        } else if (value === 'NIL') {
            result = {
                type: 'const',
                value: null
            };
        } else if (value === 'TRUE') {
            result = {
                type: 'const',
                value: true
            };
        } else if (value === 'FALSE') {
            result = {
                type: 'const',
                value: false
            };
        } else if (value === '?') {
            result = {
                type: 'const',
                value: undefined
            };
        }
        log('Constant:', result);
        return result;
    });

/*
ident   <- { type:'ident' }
*/
    ns.transform('ident', transformValue);

/*
number  <- { type:'number' }
*/
    ns.transform('number', transformValue);

/*
char    <- { type:'char' }
*/
    ns.transform('char', transformValue);

/*
string  <- { type:'string' }
*/
    ns.transform('string', transformValue);

/*
symbol  <- { type:'symbol' }
*/
    ns.transform('symbol', transformValue);

    return ns;
};
