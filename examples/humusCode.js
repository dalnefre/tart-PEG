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
    var final = { beh: 'empty_stmt' };
    var result = {
        beh: 'block_beh',
        vars: [];
        stmt: final
    };
    var scope = result.vars;
    var current = result;
    ast.value.forEach(function (stmt) {
        current.stmt = {
            beh: 'stmt_pair',
            head: gen.stmt(stmt, scope),
            tail: final
        };
        current = current.tail;
    });
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
{ type: 'let', eqtn: equation }
{ type: 'send', msg: message, to: target }
{ type: 'after_send', dt: delay, msg: message, to: target }
{ type: 'create', ident: identifier, expr: behavior }
{ type: 'become', expr: behavior }
{ type: 'throw', expr: exception }
{ type: 'expr', expr: value }
*/
gen.stmt = function genStmt(ast, scope) {
    log('genStmt:', ast, scope);
    var result = ast;
    if (ast.type === 'expr') {
        result = {
            beh: 'expr_stmt',
            expr: gen.expr(ast.expr)
        };
    } else if (ast.type === 'let') {
        result = {
            beh: 'let_stmt',
            eqtn: gen.eqtn(ast.eqtn)
        };
    } else if (ast.type === 'send') {
        result = {
            beh: 'send_stmt',
            msg: gen.expr(ast.msg),
            to: gen.expr(ast.to)
        };
    } else if (ast.type === 'after_send') {
        result = {
            beh: 'after_send_stmt',
            msg: gen.expr(ast.msg),
            to: gen.expr(ast.to),
            dt: gen.expr(ast.dt)
        };
    } else if (ast.type === 'create') {
        var ident = ast.ident.value;
        if (scope) {
            scope[scope.length] = ident;  // FIXME: check for duplicates?
        }
        result = {
            beh: 'create_stmt',
            ident: ident,
            expr: gen.expr(ast.expr)
        };
    } else if (ast.type === 'become') {
        result = {
            beh: 'become_stmt',
            expr: gen.expr(ast.expr)
        };
    } else if (ast.type === 'throw') {
        result = {
            beh: 'throw_stmt',
            expr: gen.expr(ast.expr)
        };
    }
    log('Stmt:', result);
    return result;
};

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
gen.expr = function genExpr(ast) {
    log('genExpr:', ast);
    var result = ast;
    log('Expr:', result);
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
gen.eqtn = function genEqtn(ast, scope) {
    log('genEqtn:', ast, scope);
    var result = ast;
    log('Eqtn:', result);
    return result;
};

/*
ptrn    <- pterm ',' ptrn
         / pterm
[pterm, ',', more] ==> { type: 'pair', head: pterm, tail: more }
pterm ==> value
*/
gen.ptrn = function genPtrn(ast, scope) {
    log('genPtrn:', ast, scope);
    var result = ast;
    log('Ptrn:', result);
    return result;
};

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
ident   <- { type:'ident', value:name }
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
