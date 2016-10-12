/*

humusCode.js - generate code from Humus tokens

The MIT License (MIT)

Copyright (c) 2016 Dale Schumacher

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

var gen = module.exports;

//var log = console.log;
var log = function () {};

// { value: [stmt, ...], ... }
gen.humus = function genHumus(ast) {
    log('genHumus:', ast);
    var result = genBlock(ast);
    log('Humus:', result);
    return result;
};

// { value: [stmt, ...], ... }
gen.block = function genBlock(ast) {
    log('genBlock:', ast);
    var scope = {};
    var final = { beh: 'empty_stmt' };
    var result = {
        beh: 'block_beh',
        stmt: final
    };
    var current = result;
    ast.value.forEach(function (stmt) {
        current.stmt = {
            beh: 'stmt_pair',
			head: gen.stmt(stmt, scope),
			tail: final
		};
        current = current.tail;
    });
    result.vars = Object.keys(scope);
    log('Block:', result);
    return result;
};

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
gen.stmt = function genStmt(ast, scope) {
    log('genStmt:', ast, scope);
    var result = ast;  // no-op
    log('Stmt:', result);
    return result;
};

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

/*
call    <- ident '(' expr? ')'
         / '(' expr ')' '(' expr? ')'
[ident, '(', [expr], ')'] ==> { type: 'app', abs: ident, arg: expr }
['(', abs, ')', '(', [expr], ')'] ==> { type: 'app', abs: abs, arg: expr }
*/

/*
eqtn    <- ident '(' ptrn? ')' '=' expr
         / ptrn '=' ptrn
[ident, '(', [ptrn], ')', '=', expr] ==> { type: 'eqtn', left: ident, right: { type: 'abs', ptrn: ptrn, body: expr } }
[lhs, '=', rhs] ==> { type: 'eqtn', left: lhs, right: rhs }
*/

/*
ptrn    <- pterm ',' ptrn
         / pterm
[pterm, ',', more] ==> { type: 'pair', head: pterm, tail: more }
pterm ==> value
*/

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

/*
ident   <- { type:'ident' }
*/

/*
number  <- { type:'number' }
*/

/*
char    <- { type:'char' }
*/

/*
string  <- { type:'string' }
*/

/*
symbol  <- { type:'symbol' }
*/
