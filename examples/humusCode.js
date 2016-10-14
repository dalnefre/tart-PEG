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

gen.humus = function genHumus(ast) {
    log('genHumus:', ast);
    var result = gen.block(ast);  // { value: [stmt, ...], ... }
    log('Humus:', result);
    return result;
};

gen.block = function genBlock(ast) {
    log('genBlock:', ast);
    var final = { beh: 'empty_stmt' };
    var result = {
        tail: final  // placeholder for initial statement
    };
    var scope = [];
    var current = result;
    ast.value.forEach(function (stmt) {  // { value: [stmt, ...], ... }
        current.tail = {
            beh: 'stmt_pair',
            head: gen.stmt(stmt, scope),
            tail: final
        };
        current = current.tail;
    });
    result = {
        beh: 'block_beh',
        vars: [],
        stmt: result.tail
    };
    log('Block:', result);
    return result;
};

gen.stmt = function genStmt(ast, scope) {
    log('genStmt:', ast, scope);
    var result = ast;
    if (ast.type === 'expr') {  // { type: 'expr', expr: value }
        result = {
            beh: 'expr_stmt',
            expr: gen.expr(ast.expr)
        };
    } else if (ast.type === 'let') {  // { type: 'let', eqtn: equation }
        result = {
            beh: 'let_stmt',
            eqtn: gen.eqtn(ast.eqtn, scope)
        };
    } else if (ast.type === 'send') {  // { type: 'send', msg: message, to: target }
        result = {
            beh: 'send_stmt',
            msg: gen.expr(ast.msg),
            to: gen.expr(ast.to)
        };
    } else if (ast.type === 'after_send') {  // { type: 'after_send', dt: delay, msg: message, to: target }
        result = {
            beh: 'after_send_stmt',
            msg: gen.expr(ast.msg),
            to: gen.expr(ast.to),
            dt: gen.expr(ast.dt)
        };
    } else if (ast.type === 'create') {  // { type: 'create', ident: identifier, expr: behavior }
        var name = ast.ident.value;  // extract actual identifier name
        if (scope) {
            scope[scope.length] = name;  // FIXME: check for duplicates?
        }
        result = {
            beh: 'create_stmt',
            ident: name,
            expr: gen.expr(ast.expr)
        };
    } else if (ast.type === 'become') {  // { type: 'become', expr: behavior }
        result = {
            beh: 'become_stmt',
            expr: gen.expr(ast.expr)
        };
    } else if (ast.type === 'throw') {  // { type: 'throw', expr: exception }
        result = {
            beh: 'throw_stmt',
            expr: gen.expr(ast.expr)
        };
    }
    log('Stmt:', result);
    return result;
};

gen.expr = function genExpr(ast) {
    log('genExpr:', ast);
    var result = ast;
    if (ast.type === 'pair') {  // { type: 'pair', head: term, tail: more }
        result = {
            beh: 'pair_expr',
            head: gen.expr(ast.head),
            tail: gen.expr(ast.tail)
        };
    } else if (ast.type === 'let_in') {  // { type: 'let_in', eqtn: equation, expr: expression }
        var scope = [];
        result = {
            beh: 'let_expr',
            vars: scope,  // FIXME: declare variables for LET/IN ??
            eqtn: gen.eqtn(ast.eqtn, scope),
            expr: gen.expr(ast.expr)
        };
    } else if (ast.type === 'if') {  // { type: 'if', eqtn: eqtn, expr: cnsq, next: altn }
        result = {
            beh: 'if_expr',
            eqtn: gen.eqtn(ast.eqtn),  // FIXME: track declared variables ??
            expr: gen.expr(ast.expr),
            next: gen.expr(ast.next)
        };
    } else if (ast.type === 'case') {  // { type: 'case', expr: value, next: ... }
        result = {
            beh: 'case_expr',
            expr: gen.expr(ast.expr),
            next: gen.case(ast.next)
        };
    } else if (ast.type === 'new') {  // { type: 'new', expr: term }
        result = {
            beh: 'new_expr',
            expr: gen.expr(ast.expr)
        };
    } else if (ast.type === 'app') {  // { type: 'app', abs: fn, arg: expr }
        result = {
            beh: 'app_expr',
            abs: gen.expr(ast.abs),
            arg: gen.expr(ast.arg)
        };
    } else if (ast.type === 'ident') {  // { type: 'ident', value: name }
        var name = ast.value;
        result = {
            beh: 'ident_expr',
            ident: name
        };
    } else if (ast.type === 'block') {  // { type: 'block', value: [stmt, ...] }
        result = gen.block(ast);
    } else if (ast.type === 'self') {  // { type: 'self' }
        result = {
            beh: 'self_expr'
        };
    } else if (ast.type === 'abs') {  // { type: 'abs', ptrn: ptrn, body: expr }
        result = {
            beh: 'abs_expr',
            ptrn: gen.ptrn(ast.ptrn),  // FIXME: track declared variables ??
            body: gen.expr(ast.body)
        };
    } else if (ast.type === 'const') {  // { type: 'const', value: ... }
        result = {
            beh: 'const_expr',
            ident: ast.value
        };
    } else if (ast.type === 'literal') {  // { type: 'literal', value: ... }
        result = {
            beh: 'literal_expr',
            ident: ast.value
        };
    }
    log('Expr:', result);
    return result;
};

gen.eqtn = function genEqtn(ast, scope) {
    log('genEqtn:', ast, scope);
    var result = ast;
    if (ast.type === 'eqtn') {  // { type: 'eqtn', left: lhs, right: rhs }
        result = {
            beh: 'eqtn',
            left: gen.ptrn(ast.left, scope),
            right: gen.ptrn(ast.right, scope)
        };
    }
    log('Eqtn:', result);
    return result;
};

gen.case = function genCase(ast) {
    log('genCase:', ast);
    var result = ast;
    if (ast.type === 'choice') {  // { type: 'choice', ptrn: cond, expr: body, next: ... }
        result = {
            beh: 'case_choice',
            ptrn: gen.ptrn(ast.ptrn),  // FIXME: track declared variables ??
            expr: gen.expr(ast.expr),
            next: gen.case(ast.next)
        };
    } else if (ast.type === 'end') {  // { type: 'end' }
        result = {
            beh: 'case_end'
        };
    }
    log('Case:', result);
    return result;
};

gen.ptrn = function genPtrn(ast, scope) {
    log('genPtrn:', ast, scope);
    var result = ast;
    if (ast.type === 'pair') {  // { type: 'pair', head: pterm, tail: more }
        result = {
            beh: 'pair_ptrn',
            head: gen.ptrn(ast.head, scope),
            tail: gen.ptrn(ast.tail, scope)
        };
    } else if (ast.type === 'any') {  // { type: 'any' }
        result = {
            beh: 'any_ptrn'
        };
    } else if (ast.type === 'value') {  // { type: 'value', expr: term }
        result = {
            beh: 'value_ptrn',
            expr: gen.expr(ast.expr)
        };
    } else if (ast.type === 'ident') {  // { type: 'ident', value: name }
        var name = ast.value;
        if (scope) {
            scope[scope.length] = name;  // FIXME: check for duplicates?
        }
        result = {
            beh: 'ident_ptrn',
            ident: name
        };
    } else if (ast.type === 'self') {  // { type: 'self' }
        result = {
            beh: 'self_ptrn'
        };
    } else if ((ast.type === 'block')   // { type: 'block', value: [stmt, ...] }
            || (ast.type === 'abs')) {  // { type: 'abs', ptrn: ptrn, body: expr }
        result = {
            beh: 'value_ptrn',
            expr: gen.expr(ast)
        };
    } else if (ast.type === 'const') {  // { type: 'const', value: ... }
        result = {
            beh: 'const_ptrn',
            value: ast.value
        };
    } else if (ast.type === 'literal') {  // { type: 'literal', value: ... }
        result = {
            beh: 'literal_ptrn',
            value: ast.value
        };
    }
    log('Ptrn:', result);
    return result;
};
