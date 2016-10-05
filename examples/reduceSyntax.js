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
tokens  <- token* EOF
[[token, ...], EOF] ==> [token, ...]
    ns.transform('tokens', function transformTokens(name, value) {
        log('transformTokens:', name, value);
        var result = value[0];
        log('Tokens:', result);
        return result;
    });
*/

/*
token   <- _ (symbol / number / char / string / ident / punct)
[_, token] ==> token
    ns.transform('token', function transformToken(name, value) {
        log('transformToken:', name, value);
        var result = value[1];
        log('Token:', result);
        return result;
    });
*/

/*
symbol  <- '#' (punct / name)
['#', token] ==> { type: 'symbol', value: token }
    ns.transform('symbol', function transformSymbol(name, value) {
        log('transformSymbol:', name, value);
        var result = {
            type: name,
            value: value[1]
        };
        log('Symbol:', result);
        return result;
    });
*/

/*
number  <- '-'? [0-9]+ ('#' [0-9a-zA-Z]+)?
[[sign], [digits, ...] []] ==> {
    type: 'number',
    sign: sign,
    radix: 10,
    digits: digits...,
    value: parseInt(digits..., 10)
}
[[sign], [radix, ...], ['#', [digits, ...]]] ==> {
    type: 'number',
    sign: sign,
    radix: parseInt(radix..., 10),
    digits: digits...,
    value: parseInt(digits..., .radix)
}
    ns.transform('number', function transformNumber(name, value) {
        log('transformNumber:', name, value);
        var result = {
            type: name
        };
        result.sign = value[0][0];
        result.radix = value[1].join('');
        if (value[2].length) {
            result.digits = value[2][0][1].join('');
            result.radix = parseInt(result.radix, 10);
        } else {
            result.digits = result.radix;
            result.radix = 10;
        }
        result.value = parseInt(result.digits, result.radix);
        if (result.sign == '-') {
            result.value = -(result.value);
        }
        log('Number:', result);
        return result;
    });
*/

/*
char    <- "'" (!"'" qchar) "'"
['\'', [undefined, qchar], '\''] ==> { type: 'char', value: qchar }
    ns.transform('char', function transformChar(name, value) {
        log('transformChar:', name, value);
        var result = {
            type: name,
            value: value[1][1]
        };
        log('Char:', result);
        return result;
    });
*/

/*
string  <- '"' (!'"' qchar)+ '"'
['"', [[undefined, qchar], ...], '"'] ==> { type: 'string', value: qchar... }
    ns.transform('string', function transformString(name, value) {
        log('transformString:', name, value);        
        var list = value[1];
        var s = '';
        for (var i = 0; i < list.length; ++i) {
            s += list[i][1];
        }
        var result = {
            type: name,
            value: s
        };
        log('String:', result);
        return result;
    });
*/

    var escChars = {
        'n': '\n',
        'r': '\r',
        't': '\t',
        "'": "'",
        '"': '"',
        '[': '[',
        ']': ']',
        '\\': '\\'
    };
/*
qchar   <- '\\' [nrt'"\[\]\\]
         / '\\u' [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F]
         / !'\\' .
['\\', esc] ==> esc
[undefined, char] ==> char
    ns.transform('qchar', function transformCharacter(name, value) {
        log('transformCharacter:', name, value);
        var result = value[1];
        if (value[0] === '\\') {
            result = escChars[result];  // FIXME: handle unicode escapes!
        }
        log('Character:', result);
        return result;
    });
*/

/*
ident   <- name
name ==> name IF isKeyword(name)
name ==> { type: 'ident', value: name } OTHERWISE
    ns.transform('ident', function transformIdent(name, value) {
        log('transformIdent:', name, value);
        var result = value;
        if (!isKeyword(result)) {
            result = {
                type: name,
                value: value
            };
        }
        log('Ident:', result);
        return result;
    });
*/

/*
name    <- [-0-9a-zA-Z!%&'*+/?@^_~]+
[char, ...] ==> char...
    ns.transform('name', function transformName(name, value) {
        log('transformName:', name, value);
        var result = value.join('');
        log('Name:', result);
        return result;
    });
*/

/*
punct   <- [#$(),.:;=\[\\\]]
char ==> char
    ns.transform('punct', transformValue);
*/

/*
_       <- (comment / space)*               # optional whitespace
[...] ==> { type: '_' }
    ns.transform('_', transformNamed);
*/

/*
block   <- '[' stmt* ']'
*/
    ns.transform('block', transformDefault);

/*
stmt    <- 'LET' eqtn !'IN'
         / ('AFTER' expr)? 'SEND' expr 'TO' expr
         / 'CREATE' ident 'WITH' expr
         / 'BECOME' expr
         / 'THROW' expr
         / expr
*/
    ns.transform('stmt', transformDefault);

/*
expr    <- 'LET' eqtn 'IN' expr
         / 'IF' eqtn expr ('ELIF' eqtn expr)* ('ELSE' expr)?
         / 'CASE' expr 'OF' (ptrn ':' expr)+ 'END'
         / term ',' expr
         / term
*/
    ns.transform('expr', transformDefault);

/*
term    <- 'NEW' term
         / const
         / call
         / '(' expr? ')'
         / ident
*/
    ns.transform('term', transformDefault);

/*
call    <- ident '(' expr? ')'
         / '(' expr ')' '(' expr? ')'
*/
    ns.transform('call', transformDefault);

/*
eqtn    <- ident '(' ptrn? ')' '=' expr
         / ptrn '=' ptrn
*/
    ns.transform('eqtn', transformDefault);

/*
ptrn    <- pterm ',' ptrn
         / pterm
*/
    ns.transform('ptrn', transformDefault);

/*
pterm   <- '_'
         / '$' term
         / '(' ptrn? ')'
         / const
         / ident
*/
    ns.transform('pterm', transformDefault);

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
*/
    ns.transform('const', transformDefault);

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
