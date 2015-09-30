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
 * build(sponsor) - construct parsing actors for PEG grammar
 */
grammar.build = function build(sponsor) {
    var ns = named.scope(sponsor);

    /*
    Grammar <- _ Rule+ EOF
    */
    ns.define('Grammar',
        sponsor(PEG.sequencePtrn([
            ns.lookup('_'),
            sponsor(PEG.oneOrMorePtrn(
                ns.lookup('Rule')
            )),
            ns.lookup('EOF')
        ]))
    );
    /*
    Rule <- Name LEFTARROW Expression
    */
    ns.define('Rule',
        sponsor(PEG.sequencePtrn([
            ns.lookup('Name'),
            ns.lookup('LEFTARROW'),
            ns.lookup('Expression')
        ]))
    );
    /*
    Expression <- Sequence (SLASH Sequence)*
    */
    ns.define('Expression',
        sponsor(PEG.sequencePtrn([
            ns.lookup('Sequence'),
            sponsor(PEG.zeroOrMorePtrn(
                sponsor(PEG.sequencePtrn([
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
        sponsor(PEG.zeroOrMorePtrn(
            ns.lookup('Prefix')
        ))
    );
    /*
    Prefix <- (AND / NOT)? Suffix
    */
    ns.define('Prefix',
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.zeroOrOnePtrn(
                sponsor(PEG.choicePtrn([
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
        sponsor(PEG.sequencePtrn([
            ns.lookup('Primary'),
            sponsor(PEG.zeroOrOnePtrn(
                sponsor(PEG.choicePtrn([
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
             / DOT
    */
    ns.define('Primary',
        sponsor(PEG.choicePtrn([
            sponsor(PEG.sequencePtrn([
                ns.lookup('Name'),
                sponsor(PEG.notPtrn(
                    ns.lookup('LEFTARROW')
                ))
            ])),
            sponsor(PEG.sequencePtrn([
                ns.lookup('OPEN'),
                ns.lookup('Expression'),
                ns.lookup('CLOSE')
            ])),
            ns.lookup('Literal'),
            ns.lookup('Class'),
            ns.lookup('DOT')
        ]))
    );

    /*
    Name <- [a-zA-Z_] [a-zA-Z_0-9]* _
    */
    ns.define('Name',
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.predicatePtrn(function(token) {
                return /[a-zA-Z_]/.test(token);
            })),
            sponsor(PEG.zeroOrMorePtrn(
                sponsor(PEG.predicatePtrn(function(token) {
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
        sponsor(PEG.choicePtrn([
            sponsor(PEG.sequencePtrn([
                sponsor(PEG.terminalPtrn('"')),
                sponsor(PEG.oneOrMorePtrn(
                    sponsor(PEG.sequencePtrn([
                        sponsor(PEG.notPtrn(
                            sponsor(PEG.terminalPtrn('"'))
                        )),
                        ns.lookup('Character')
                    ]))
                )),
                sponsor(PEG.terminalPtrn('"')),
                ns.lookup('_')
            ])),
            sponsor(PEG.sequencePtrn([
                sponsor(PEG.terminalPtrn("'")),
                sponsor(PEG.oneOrMorePtrn(
                    sponsor(PEG.sequencePtrn([
                        sponsor(PEG.notPtrn(
                            sponsor(PEG.terminalPtrn("'"))
                        )),
                        ns.lookup('Character')
                    ]))
                )),
                sponsor(PEG.terminalPtrn("'")),
                ns.lookup('_')
            ]))
        ]))
    );
    /*
    Class <- "[" (!"]" Range)+ "]" _
    */
    ns.define('Class',
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.terminalPtrn('[')),
            sponsor(PEG.oneOrMorePtrn(
                sponsor(PEG.sequencePtrn([
                    sponsor(PEG.notPtrn(
                        sponsor(PEG.terminalPtrn(']'))
                    )),
                    ns.lookup('Range')
                ]))
            )),
            sponsor(PEG.terminalPtrn(']')),
            ns.lookup('_')
        ]))
    );
    /*
    Range <- Character "-" Character / Character
    */
    ns.define('Range',
        sponsor(PEG.choicePtrn([
            sponsor(PEG.sequencePtrn([
                ns.lookup('Character'),
                sponsor(PEG.terminalPtrn('-')),
                ns.lookup('Character')
            ])),
            ns.lookup('Character')
        ]))
    );
    /*
    Character <- "\\" [nrt'"[\]\\]
               \ "\\u" [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F]
               \ !"\\" .
    */
    ns.define('Character',
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

    /*
    LEFTARROW <- "<-" _
    */
    ns.define('LEFTARROW',
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.terminalPtrn('<')),
            sponsor(PEG.terminalPtrn('-')),
            ns.lookup('_')
        ]))
    );
    /*
    SLASH <- "/" _
    */
    ns.define('SLASH',
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.terminalPtrn('/')),
            ns.lookup('_')
        ]))
    );
    /*
    AND <- "&" _
    */
    ns.define('AND',
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.terminalPtrn('&')),
            ns.lookup('_')
        ]))
    );
    /*
    NOT <- "!" _
    */
    ns.define('NOT',
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.terminalPtrn('!')),
            ns.lookup('_')
        ]))
    );
    /*
    QUESTION <- "?" _
    */
    ns.define('QUESTION',
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.terminalPtrn('?')),
            ns.lookup('_')
        ]))
    );
    /*
    STAR <- "*" _
    */
    ns.define('STAR',
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.terminalPtrn('*')),
            ns.lookup('_')
        ]))
    );
    /*
    PLUS <- "+" _
    */
    ns.define('PLUS',
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.terminalPtrn('+')),
            ns.lookup('_')
        ]))
    );
    /*
    OPEN <- "(" _
    */
    ns.define('OPEN',
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.terminalPtrn('(')),
            ns.lookup('_')
        ]))
    );
    /*
    CLOSE <- ")" _
    */
    ns.define('CLOSE',
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.terminalPtrn(')')),
            ns.lookup('_')
        ]))
    );
    /*
    DOT <- "." _
    */
    ns.define('DOT',
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.terminalPtrn('.')),
            ns.lookup('_')
        ]))
    );

    /*
    _ <- (Space / Comment)*  # optional whitespace
    */
    ns.define('_',  // optional whitespace
        sponsor(PEG.zeroOrMorePtrn(
            sponsor(PEG.choicePtrn([
                ns.lookup('Space'),
                ns.lookup('Comment')
            ]))
        ))
    );
    /*
    Comment <- "#" (!EOL .)*
    */
    ns.define('Comment',
        sponsor(PEG.sequencePtrn([
            sponsor(PEG.terminalPtrn('#')),
            sponsor(PEG.zeroOrMorePtrn(
                sponsor(PEG.sequencePtrn([
                    sponsor(PEG.notPtrn(
                        ns.lookup('EOL')
                    )),
                    sponsor(PEG.anythingBeh)
                ]))
            ))
        ]))
    );
    /*
    Space <- [ \t-\r]
    */
    ns.define('Space',
        sponsor(PEG.predicatePtrn(function(token) {
            return /\s/.test(token);
        }))
    );
    /*
    EOL <- "\n"
         / "\r" "\n"?
    */
    ns.define('EOL',
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
    /*
    EOF <- !.
    */
    ns.define('EOF',
        sponsor(PEG.notPtrn(
            sponsor(PEG.anythingBeh)
        ))
    );

    return ns;  // return grammar namespace
};
