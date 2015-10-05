/*

grammar.js - grammar for ASCII text representation of PEG

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

var grammar = module.exports;

var PEG = require('./index.js');
var named = require('./named.js');

/*
 * build(sponsor[, log]) - construct parsing actors for PEG grammar
 */
grammar.build = function build(sponsor, log) {
    var ns = named.scope(sponsor, { log: log });

    /*
    Grammar <- _ Rule+ EOF
    */
    ns.define('Grammar',
        sponsor(PEG.sequence([
            ns.lookup('_'),
            sponsor(PEG.oneOrMore(
                ns.lookup('Rule')
            )),
            ns.lookup('EOF')
        ]))
    );
    /*
    Rule <- Name LEFTARROW Expression
    */
    ns.define('Rule',
        sponsor(PEG.sequence([
            ns.lookup('Name'),
            ns.lookup('LEFTARROW'),
            ns.lookup('Expression')
        ]))
    );
    /*
    Expression <- Sequence (SLASH Sequence)*
    */
    ns.define('Expression',
        sponsor(PEG.sequence([
            ns.lookup('Sequence'),
            sponsor(PEG.zeroOrMore(
                sponsor(PEG.sequence([
                    ns.lookup('SLASH'),
                    ns.lookup('Sequence')
                ]))
            ))
        ]))
    );
    /*
    Sequence <- Prefix*
    */
    ns.define('Sequence',
        sponsor(PEG.zeroOrMore(
            ns.lookup('Prefix')
        ))
    );
    /*
    Prefix <- (AND / NOT)? Suffix
    */
    ns.define('Prefix',
        sponsor(PEG.sequence([
            sponsor(PEG.zeroOrOne(
                sponsor(PEG.choice([
                    ns.lookup('AND'),
                    ns.lookup('NOT')
                ]))
            )),
            ns.lookup('Suffix')
        ]))
    );
    /*
    Suffix <- Primary (QUESTION / STAR / PLUS)?
    */
    ns.define('Suffix',
        sponsor(PEG.sequence([
            ns.lookup('Primary'),
            sponsor(PEG.zeroOrOne(
                sponsor(PEG.choice([
                    ns.lookup('QUESTION'),
                    ns.lookup('STAR'),
                    ns.lookup('PLUS')
                ]))
            ))
        ]))
    );
    /*
    Primary <- Name !LEFTARROW
             / OPEN Expression CLOSE
             / Literal
             / Class
             / Object
             / DOT
    */
    ns.define('Primary',
        sponsor(PEG.choice([
            sponsor(PEG.sequence([
                ns.lookup('Name'),
                sponsor(PEG.not(
                    ns.lookup('LEFTARROW')
                ))
            ])),
            sponsor(PEG.sequence([
                ns.lookup('OPEN'),
                ns.lookup('Expression'),
                ns.lookup('CLOSE')
            ])),
            ns.lookup('Literal'),
            ns.lookup('Class'),
            ns.lookup('Object'),
            ns.lookup('DOT')
        ]))
    );

    /*
    Name <- [a-zA-Z_] [a-zA-Z_0-9]* _
    */
    ns.define('Name',
        sponsor(PEG.sequence([
            sponsor(PEG.predicate(function(token) {
                return /[a-zA-Z_]/.test(token);
            })),
            sponsor(PEG.zeroOrMore(
                sponsor(PEG.predicate(function(token) {
                    return /[a-zA-Z_0-9]/.test(token);
                }))
            )),
            ns.lookup('_')
        ]))
    );
    /*
    Literal <- ["] (!["] Character)+ ["] _
             / ['] (!['] Character)+ ['] _
    */
    ns.define('Literal',
        sponsor(PEG.choice([
            sponsor(PEG.sequence([
                sponsor(PEG.terminal('"')),
                sponsor(PEG.oneOrMore(
                    sponsor(PEG.sequence([
                        sponsor(PEG.not(
                            sponsor(PEG.terminal('"'))
                        )),
                        ns.lookup('Character')
                    ]))
                )),
                sponsor(PEG.terminal('"')),
                ns.lookup('_')
            ])),
            sponsor(PEG.sequence([
                sponsor(PEG.terminal("'")),
                sponsor(PEG.oneOrMore(
                    sponsor(PEG.sequence([
                        sponsor(PEG.not(
                            sponsor(PEG.terminal("'"))
                        )),
                        ns.lookup('Character')
                    ]))
                )),
                sponsor(PEG.terminal("'")),
                ns.lookup('_')
            ]))
        ]))
    );
    /*
    Class <- "[" (!"]" Range)+ "]" _
    */
    ns.define('Class',
        sponsor(PEG.sequence([
            sponsor(PEG.terminal('[')),
            sponsor(PEG.oneOrMore(
                sponsor(PEG.sequence([
                    sponsor(PEG.not(
                        sponsor(PEG.terminal(']'))
                    )),
                    ns.lookup('Range')
                ]))
            )),
            sponsor(PEG.terminal(']')),
            ns.lookup('_')
        ]))
    );
    /*
    Range <- Character "-" Character / Character
    */
    ns.define('Range',
        sponsor(PEG.choice([
            sponsor(PEG.sequence([
                ns.lookup('Character'),
                sponsor(PEG.terminal('-')),
                ns.lookup('Character')
            ])),
            ns.lookup('Character')
        ]))
    );
    /*
    Character <- "\\" [nrt'"\[\]\\]
               / "\\u" [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F]
               / !"\\" .
    */
    ns.define('Character',
        sponsor(PEG.choice([
            sponsor(PEG.sequence([
                sponsor(PEG.terminal('\\')),
                sponsor(PEG.predicate(function(token) {
                    return /[nrt'"\[\]\\]/.test(token);
                }))
            ])),
            sponsor(PEG.sequence([
                sponsor(PEG.terminal('\\')),
                sponsor(PEG.terminal('u')),
                sponsor(PEG.predicate(function(token) {
                    return /[0-9a-fA-F]/.test(token);
                })),
                sponsor(PEG.predicate(function(token) {
                    return /[0-9a-fA-F]/.test(token);
                })),
                sponsor(PEG.predicate(function(token) {
                    return /[0-9a-fA-F]/.test(token);
                })),
                sponsor(PEG.predicate(function(token) {
                    return /[0-9a-fA-F]/.test(token);
                }))
            ])),
            sponsor(PEG.sequence([
                sponsor(PEG.not(
                    sponsor(PEG.terminal('\\'))
                )),
                sponsor(PEG.anything)
            ]))
        ]))
    );
    /*
    Object <- LBRACE (Property (COMMA Property)*)? RBRACE
    */
    ns.define('Object',
        sponsor(PEG.sequence([
            ns.lookup('LBRACE'),
            sponsor(PEG.zeroOrOne(
                sponsor(PEG.sequence([
                    ns.lookup('Property'),
                    sponsor(PEG.zeroOrMore(
                        sponsor(PEG.sequence([
                            ns.lookup('COMMA'),
                            ns.lookup('Property')
                        ]))
                    ))
                ]))
            )),
            ns.lookup('RBRACE')
        ]))
    );
    /*
    Property <- Name COLON Expression
    */
    ns.define('Property',
        sponsor(PEG.sequence([
            ns.lookup('Name'),
            ns.lookup('COLON'),
            ns.lookup('Expression')
        ]))
    );

    /*
    LEFTARROW <- "<-" _
    */
    ns.define('LEFTARROW',
        sponsor(PEG.sequence([
            sponsor(PEG.terminal('<')),
            sponsor(PEG.terminal('-')),
            ns.lookup('_')
        ]))
    );
    /*
    SLASH <- "/" _
    */
    ns.define('SLASH',
        sponsor(PEG.sequence([
            sponsor(PEG.terminal('/')),
            ns.lookup('_')
        ]))
    );
    /*
    AND <- "&" _
    */
    ns.define('AND',
        sponsor(PEG.sequence([
            sponsor(PEG.terminal('&')),
            ns.lookup('_')
        ]))
    );
    /*
    NOT <- "!" _
    */
    ns.define('NOT',
        sponsor(PEG.sequence([
            sponsor(PEG.terminal('!')),
            ns.lookup('_')
        ]))
    );
    /*
    QUESTION <- "?" _
    */
    ns.define('QUESTION',
        sponsor(PEG.sequence([
            sponsor(PEG.terminal('?')),
            ns.lookup('_')
        ]))
    );
    /*
    STAR <- "*" _
    */
    ns.define('STAR',
        sponsor(PEG.sequence([
            sponsor(PEG.terminal('*')),
            ns.lookup('_')
        ]))
    );
    /*
    PLUS <- "+" _
    */
    ns.define('PLUS',
        sponsor(PEG.sequence([
            sponsor(PEG.terminal('+')),
            ns.lookup('_')
        ]))
    );
    /*
    OPEN <- "(" _
    */
    ns.define('OPEN',
        sponsor(PEG.sequence([
            sponsor(PEG.terminal('(')),
            ns.lookup('_')
        ]))
    );
    /*
    CLOSE <- ")" _
    */
    ns.define('CLOSE',
        sponsor(PEG.sequence([
            sponsor(PEG.terminal(')')),
            ns.lookup('_')
        ]))
    );
    /*
    DOT <- "." _
    */
    ns.define('DOT',
        sponsor(PEG.sequence([
            sponsor(PEG.terminal('.')),
            ns.lookup('_')
        ]))
    );
    /*
    LBRACE <- "{" _
    */
    ns.define('LBRACE',
        sponsor(PEG.sequence([
            sponsor(PEG.terminal('{')),
            ns.lookup('_')
        ]))
    );
    /*
    RBRACE <- "}" _
    */
    ns.define('RBRACE',
        sponsor(PEG.sequence([
            sponsor(PEG.terminal('}')),
            ns.lookup('_')
        ]))
    );
    /*
    COLON <- ":" _
    */
    ns.define('COLON',
        sponsor(PEG.sequence([
            sponsor(PEG.terminal(':')),
            ns.lookup('_')
        ]))
    );
    /*
    COMMA <- "," _
    */
    ns.define('COMMA',
        sponsor(PEG.sequence([
            sponsor(PEG.terminal(',')),
            ns.lookup('_')
        ]))
    );

    /*
    _ <- (Space / Comment)*  # optional whitespace
    */
    ns.define('_',  // optional whitespace
        sponsor(PEG.zeroOrMore(
            sponsor(PEG.choice([
                ns.lookup('Space'),
                ns.lookup('Comment')
            ]))
        ))
    );
    /*
    Comment <- "#" (!EOL .)*
    */
    ns.define('Comment',
        sponsor(PEG.sequence([
            sponsor(PEG.terminal('#')),
            sponsor(PEG.zeroOrMore(
                sponsor(PEG.sequence([
                    sponsor(PEG.not(
                        ns.lookup('EOL')
                    )),
                    sponsor(PEG.anything)
                ]))
            ))
        ]))
    );
    /*
    Space <- [ \t-\r]
    */
    ns.define('Space',
        sponsor(PEG.predicate(function(token) {
            return /\s/.test(token);
        }))
    );
    /*
    EOL <- "\n"
         / "\r" "\n"?
    */
    ns.define('EOL',
        sponsor(PEG.choice([
            sponsor(PEG.terminal('\n')),
            sponsor(PEG.sequence([
                sponsor(PEG.terminal('\r')),
                sponsor(PEG.zeroOrOne(
                    sponsor(PEG.terminal('\n'))
                ))
            ]))
        ]))
    );
    /*
    EOF <- !.
    */
    ns.define('EOF',
        sponsor(PEG.not(
            sponsor(PEG.anything)
        ))
    );

    return ns;  // return grammar namespace
};
