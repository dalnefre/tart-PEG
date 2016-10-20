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

gen._code = (function () {
    var the_empty_stmt = { beh: 'empty_stmt' };
    var the_case_end = { beh: 'case_end' };
    var the_self_expr = { beh: 'self_expr' };
    var the_any_ptrn = { beh: 'any_ptrn' };
    var the_self_ptrn = { beh: 'self_ptrn' };

    return {
        block: function block(vars, stmt) {
            return { beh: 'block', vars: vars, stmt: stmt };
        },
        pair_stmt: function pair_stmt(head, tail) {
            return { beh: 'pair_stmt', head: head, tail: tail };
        },
        empty_stmt: function empty_stmt() {
            return the_empty_stmt;
        },
        expr_stmt: function expr_stmt(expr) {
            return { beh: 'expr_stmt', expr: expr };
        },
        let_stmt: function let_stmt(eqtn) {
            return { beh: 'let_stmt', eqtn: eqtn };
        },
        send_stmt: function send_stmt(msg, to) {
            return { beh: 'send_stmt', msg: msg, to: to };
        },
        after_send_stmt: function after_send_stmt(msg, to, dt) {
            return { beh: 'after_send_stmt', msg: msg, to: to, dt: dt };
        },
        create_stmt: function create_stmt(name, expr) {
            return { beh: 'create_stmt', ident: name, expr: expr };
        },
        become_stmt: function become_stmt(expr) {
            return { beh: 'become_stmt', expr: expr };
        },
        throw_stmt: function throw_stmt(expr) {
            return { beh: 'throw_stmt', expr: expr };
        },
        pair_expr: function pair_expr(head, tail) {
            return { beh: 'pair_expr', head: head, tail: tail };
        },
        let_expr: function let_expr(eqtn, expr) {
            return { beh: 'let_expr', eqtn: eqtn, expr: expr };
        },
        if_expr: function if_expr(eqtn, expr, next) {
            return { beh: 'if_expr', eqtn: eqtn, expr: expr, next: next };
        },
        case_expr: function case_expr(expr, next) {
            return { beh: 'case_expr', expr: expr, next: next };
        },
        case_choice: function case_choice(ptrn, expr, next) {
            return { beh: 'case_choice', ptrn: ptrn, expr: expr, next: next };
        },
        case_end: function case_end() {
            return the_case_end;
        },
        new_expr: function new_expr(expr) {
            return { beh: 'new_expr', expr: expr };
        },
        app_expr: function app_expr(abs, arg) {
            return { beh: 'app_expr', abs: abs, arg: arg };
        },
        ident_expr: function ident_expr(name) {
            return { beh: 'ident_expr', ident: name };
        },
        self_expr: function self_expr() {
            return the_self_expr;
        },
        abs_expr: function abs_expr(ptrn, body) {
            return { beh: 'abs_expr', ptrn: ptrn, body: body };
        },
        const_expr: function const_expr(value) {
            return { beh: 'const_expr', value: value };
        },
        literal_expr: function literal_expr(value) {
            return { beh: 'literal_expr', value: value };
        },
        eqtn: function eqtn(left, right) {
            return { beh: 'eqtn', left: left, right: right };
        },
        any_ptrn: function any_ptrn() {
            return the_any_ptrn;
        },
        pair_ptrn: function pair_ptrn(head, tail) {
            return { beh: 'pair_ptrn', head: head, tail: tail };
        },
        ident_ptrn: function ident_ptrn(name) {
            return { beh: 'ident_ptrn', ident: name };
        },
        self_ptrn: function self_ptrn() {
            return the_self_ptrn;
        },
        value_ptrn: function value_ptrn(expr) {
            return { beh: 'value_ptrn', expr: expr };
        },
        const_ptrn: function const_ptrn(value) {
            return { beh: 'const_ptrn', value: value };
        },
        literal_ptrn: function literal_ptrn(value) {
            return { beh: 'literal_ptrn', value: value };
        }
    };
})();

gen._visit = (function () {
    var visit = function visit(node, visitor) {
        var action = self[node.beh];
        if (action) {
            action(node, visitor);
        }
    };

    var self = {
        block: function block(node, visitor) {  // { beh: 'block', vars: vars, stmt: stmt }
            visit(node.stmt, visitor);
        },
        pair_stmt: function pair_expr(node, visitor) {  // { beh: 'pair_stmt', head: head, tail: tail }
            visit(node.head, visitor);
            visit(node.tail, visitor);
        },
        empty_stmt: function empty_stmt(node, visitor) {  // { beh: 'empty_stmt' }
        },
        expr_stmt: function expr_stmt(node, visitor) {  // { beh: 'expr_stmt', expr: expr }
            visit(node.expr, visitor);
        },
        let_stmt: function let_stmt(node, visitor) {  // { beh: 'let_stmt', eqtn: eqtn }
            visit(node.eqtn, visitor);
        },
        send_stmt: function send_stmt(node, visitor) {  // { beh: 'send_stmt', msg: msg, to: to }
            visit(node.msg, visitor);
            visit(node.to, visitor);
        },
        after_send_stmt: function after_send_stmt(node, visitor) {  // { beh: 'after_send_stmt', msg: msg, to: to, dt: dt }
            visit(node.dt, visitor);
            visit(node.msg, visitor);
            visit(node.to, visitor);
        },
        create_stmt: function create_stmt(node, visitor) {  // { beh: 'create_stmt', ident: name, expr: expr }
            visit(node.expr, visitor);
        },
        become_stmt: function become_stmt(node, visitor) {  // { beh: 'become_stmt', expr: expr }
            visit(node.expr, visitor);
        },
        throw_stmt: function throw_stmt(node, visitor) {  // { beh: 'throw_stmt', expr: expr }
            visit(node.expr, visitor);
        },
        pair_expr: function pair_expr(node, visitor) {  // { beh: 'pair_expr', head: head, tail: tail }
            visit(node.head, visitor);
            visit(node.tail, visitor);
        },
        let_expr: function let_expr(node, visitor) {  // { beh: 'let_expr', eqtn: eqtn, expr: expr }
            visit(node.eqtn, visitor);
            visit(node.expr, visitor);
        },
        if_expr: function if_expr(node, visitor) {  // { beh: 'if_expr', eqtn: eqtn, expr: expr, next: next }
            visit(node.eqtn, visitor);
            visit(node.expr, visitor);
            visit(node.next, visitor);
        },
        case_expr: function case_expr(node, visitor) {  // { beh: 'case_expr', expr: expr, next: next }
            visit(node.expr, visitor);
            visit(node.next, visitor);
        },
        case_choice: function case_choice(node, visitor) {  // { beh: 'case_choice', ptrn: ptrn, expr: expr, next: next }
            visit(node.ptrn, visitor);
            visit(node.expr, visitor);
            visit(node.next, visitor);
        },
        case_end: function case_end(node, visitor) {  // { beh: 'case_end' }
        },
        new_expr: function new_expr(node, visitor) {  // { beh: 'new_expr', expr: expr }
            visit(node.expr, visitor);
        },
        app_expr: function app_expr(node, visitor) {  // { beh: 'app_expr', abs: abs, arg: arg }
            visit(node.abs, visitor);
            visit(node.arg, visitor);
        },
        ident_expr: function ident_expr(node, visitor) {  // { beh: 'ident_expr', ident: name }
        },
        self_expr: function self_expr(node, visitor) {  // { beh: 'self_expr' };
        },
        abs_expr: function abs_expr(node, visitor) {  // { beh: 'abs_expr', ptrn: ptrn, body: body };
            visit(node.ptrn, visitor);
            visit(node.body, visitor);
        },
        const_expr: function const_expr(node, visitor) {  // { beh: 'const_expr', value: value };
        },
        literal_expr: function literal_expr(node, visitor) {  // { beh: 'literal_expr', value: value };
        },
        eqtn: function eqtn(node, visitor) {  // { beh: 'eqtn', left: left, right: right };
            visit(node.left, visitor);
            visit(node.right, visitor);
        },
        any_ptrn: function any_ptrn(node, visitor) {  // { beh: 'any_ptrn' };
        },
        pair_ptrn: function pair_ptrn(node, visitor) {  // { beh: 'pair_ptrn', head: head, tail: tail };
            visit(node.head, visitor);
            visit(node.tail, visitor);
        },
        ident_ptrn: function ident_ptrn(node, visitor) {  // { beh: 'ident_ptrn', ident: name };
        },
        self_ptrn: function self_ptrn(node, visitor) {  // { beh: 'self_ptrn' };
        },
        value_ptrn: function value_ptrn(node, visitor) {  // { beh: 'value_ptrn', expr: expr };
            visit(node.expr, visitor);
        },
        const_ptrn: function const_ptrn(node, visitor) {  // { beh: 'const_ptrn', value: value };
        },
        literal_ptrn: function literal_ptrn(node, visitor) {  // { beh: 'literal_ptrn', value: value };
        }
    };
    return self;
})();

gen.humus = function genHumus(ast) {
    log('genHumus:', ast);
    var scope = [];  // IMPORTANT: MUST ADD VARS TO SCOPE BEFORE GENERATING CODE
    var block = gen.block(ast.value, scope);  // { value: [stmt, ...], ... }
    var result = gen._code.block(scope, block);
    log('Humus:', result);
    return result;
};

gen.block = function genBlock(list, scope) {
    log('genBlock:', list, scope);
    var result = list;
    if (list.length > 0) {  // [stmt, ...]
        var head = gen.stmt(list[0], scope);
        var tail = gen.block(list.slice(1), scope);
        // IMPORTANT: MUST ADD VARS TO SCOPE BEFORE GENERATING CODE
        result = gen._code.pair_stmt(head, tail);
    } else {  // []
        result = gen._code.empty_stmt();
    }
    log('Block:', result);
    return result;
};

gen.stmt = function genStmt(ast, scope) {
    log('genStmt:', ast, scope);
    var result = ast;
    if (ast.type === 'expr') {  // { type: 'expr', expr: value }
        result = gen._code.expr_stmt(gen.expr(ast.expr));
    } else if (ast.type === 'let') {  // { type: 'let', eqtn: equation }
        result = gen._code.let_stmt(gen.eqtn(ast.eqtn, scope));
    } else if (ast.type === 'send') {  // { type: 'send', msg: message, to: target }
        result = gen._code.send_stmt(
            gen.expr(ast.msg), 
            gen.expr(ast.to)
        );
    } else if (ast.type === 'after_send') {  // { type: 'after_send', dt: delay, msg: message, to: target }
        result = gen._code.after_send_stmt(
            gen.expr(ast.msg), 
            gen.expr(ast.to),
            gen.expr(ast.dt)
        );
    } else if (ast.type === 'create') {  // { type: 'create', ident: identifier, expr: behavior }
        var name = ast.ident.value;  // extract actual identifier name
        if (scope) {
            scope.push(name);  // FIXME: check for duplicates?
        }
        result = gen._code.create_stmt(name, gen.expr(ast.expr));
    } else if (ast.type === 'become') {  // { type: 'become', expr: behavior }
        result = gen._code.become_stmt(gen.expr(ast.expr));
    } else if (ast.type === 'throw') {  // { type: 'throw', expr: exception }
        result = gen._code.throw_stmt(gen.expr(ast.expr));
    }
    log('Stmt:', result);
    return result;
};

gen.expr = function genExpr(ast) {
    log('genExpr:', ast);
    var result = ast;
    if (ast.type === 'pair') {  // { type: 'pair', head: term, tail: more }
        result = gen._code.pair_expr(
            gen.expr(ast.head), 
            gen.expr(ast.tail)
        );
    } else if (ast.type === 'let_in') {  // { type: 'let_in', eqtn: equation, expr: expression }
        result = gen._code.let_expr(
            gen.eqtn(ast.eqtn),  // FIXME: track declared variables ??
            gen.expr(ast.expr)
        );
    } else if (ast.type === 'if') {  // { type: 'if', eqtn: eqtn, expr: cnsq, next: altn }
        result = gen._code.if_expr(
            gen.eqtn(ast.eqtn),  // FIXME: track declared variables ??
            gen.expr(ast.expr),
            gen.expr(ast.next)
        );
    } else if (ast.type === 'case') {  // { type: 'case', expr: value, next: ... }
        result = gen._code.case_expr(
            gen.expr(ast.expr),
            gen.case(ast.next)
        );
    } else if (ast.type === 'new') {  // { type: 'new', expr: term }
        result = gen._code.new_expr(gen.expr(ast.expr));
    } else if (ast.type === 'app') {  // { type: 'app', abs: fn, arg: expr }
        result = gen._code.app_expr(
            gen.expr(ast.abs),
            gen.expr(ast.arg)
        );
    } else if (ast.type === 'ident') {  // { type: 'ident', value: name }
        result = gen._code.ident_expr(ast.value);
    } else if (ast.type === 'block') {  // { type: 'block', value: [stmt, ...] }
        result = gen.humus(ast);
    } else if (ast.type === 'self') {  // { type: 'self' }
        result = gen._code.self_expr();
    } else if (ast.type === 'abs') {  // { type: 'abs', ptrn: ptrn, body: expr }
        result = gen._code.abs_expr(
            gen.ptrn(ast.ptrn),  // FIXME: track declared variables ??
            gen.expr(ast.body)
        );
    } else if (ast.type === 'const') {  // { type: 'const', value: ... }
        result = gen._code.const_expr(ast.value);
    } else if (ast.type === 'literal') {  // { type: 'literal', value: ... }
        result = gen._code.literal_expr(ast.value);
    }
    log('Expr:', result);
    return result;
};

gen.case = function genCase(ast) {
    log('genCase:', ast);
    var result = ast;
    if (ast.type === 'choice') {  // { type: 'choice', ptrn: cond, expr: body, next: ... }
        result = gen._code.case_choice(
            gen.ptrn(ast.ptrn),  // FIXME: track declared variables ??
            gen.expr(ast.expr),
            gen.case(ast.next)
        );
    } else if (ast.type === 'end') {  // { type: 'end' }
        result = gen._code.case_end();
    }
    log('Case:', result);
    return result;
};

gen.eqtn = function genEqtn(ast, scope) {
    log('genEqtn:', ast, scope);
    var result = ast;
    if (ast.type === 'eqtn') {  // { type: 'eqtn', left: lhs, right: rhs }
        result = gen._code.eqtn(
            gen.ptrn(ast.left, scope), 
            gen.ptrn(ast.right, scope)
        );
    }
    log('Eqtn:', result);
    return result;
};

gen.ptrn = function genPtrn(ast, scope) {
    log('genPtrn:', ast, scope);
    var result = ast;
    if (ast.type === 'pair') {  // { type: 'pair', head: pterm, tail: more }
        result = gen._code.pair_ptrn(
            gen.ptrn(ast.head, scope), 
            gen.ptrn(ast.tail, scope)
        );
    } else if (ast.type === 'any') {  // { type: 'any' }
        result = gen._code.any_ptrn();
    } else if (ast.type === 'value') {  // { type: 'value', expr: term }
        result = gen._code.value_ptrn(gen.expr(ast));
    } else if (ast.type === 'ident') {  // { type: 'ident', value: name }
        var name = ast.value;
        if (scope) {
            scope.push(name);  // FIXME: check for duplicates?
        }
        result = gen._code.ident_ptrn(name);
    } else if (ast.type === 'self') {  // { type: 'self' }
        result = gen._code.self_ptrn();
    } else if ((ast.type === 'block')   // { type: 'block', value: [stmt, ...] }
            || (ast.type === 'abs')) {  // { type: 'abs', ptrn: ptrn, body: expr }
        result = gen._code.value_ptrn(gen.expr(ast));
    } else if (ast.type === 'const') {  // { type: 'const', value: ... }
        result = gen._code.const_ptrn(ast.value);
    } else if (ast.type === 'literal') {  // { type: 'literal', value: ... }
        result = gen._code.literal_ptrn(ast.value);
    }
    log('Ptrn:', result);
    return result;
};
