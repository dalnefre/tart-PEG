/* Generated PEG grammar */
"use strict";
var grammar = module.exports;

var PEG = require("../PEG.js");

grammar.build = function build(sponsor, log) {
  var ns = PEG.namespace(log);

/*
humus   <- stmt+
*/
  ns.define("humus",
    sponsor(PEG.plus(
      sponsor(ns.lookup("stmt"))
    ))
  );

/*
block   <- '[' stmt* ']'
*/
  ns.define("block",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("[")),
      sponsor(PEG.star(
        sponsor(ns.lookup("stmt"))
      )),
      sponsor(PEG.terminal("]"))
    ]))
  );

/*
stmt    <- 'LET' eqtn !'IN'
         / ('AFTER' expr)? 'SEND' expr 'TO' expr
         / 'CREATE' ident 'WITH' expr
         / 'BECOME' expr
         / 'THROW' expr
         / expr
*/
  ns.define("stmt",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("LET")),
        sponsor(ns.lookup("eqtn")),
        sponsor(PEG.not(
          sponsor(PEG.terminal("IN"))
        ))
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.optional(
          sponsor(PEG.sequence([
            sponsor(PEG.terminal("AFTER")),
            sponsor(ns.lookup("expr"))
          ]))
        )),
        sponsor(PEG.terminal("SEND")),
        sponsor(ns.lookup("expr")),
        sponsor(PEG.terminal("TO")),
        sponsor(ns.lookup("expr"))
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("CREATE")),
        sponsor(ns.lookup("ident")),
        sponsor(PEG.terminal("WITH")),
        sponsor(ns.lookup("expr"))
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("BECOME")),
        sponsor(ns.lookup("expr"))
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("THROW")),
        sponsor(ns.lookup("expr"))
      ])),
      sponsor(ns.lookup("expr"))
    ]))
  );

/*
expr    <- 'LET' eqtn 'IN' expr
         / 'IF' eqtn expr ('ELIF' eqtn expr)* ('ELSE' expr)?
         / 'CASE' expr 'OF' (ptrn ':' expr)+ 'END'
         / term ',' expr
         / term
*/
  ns.define("expr",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("LET")),
        sponsor(ns.lookup("eqtn")),
        sponsor(PEG.terminal("IN")),
        sponsor(ns.lookup("expr"))
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("IF")),
        sponsor(ns.lookup("eqtn")),
        sponsor(ns.lookup("expr")),
        sponsor(PEG.star(
          sponsor(PEG.sequence([
            sponsor(PEG.terminal("ELIF")),
            sponsor(ns.lookup("eqtn")),
            sponsor(ns.lookup("expr"))
          ]))
        )),
        sponsor(PEG.optional(
          sponsor(PEG.sequence([
            sponsor(PEG.terminal("ELSE")),
            sponsor(ns.lookup("expr"))
          ]))
        ))
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("CASE")),
        sponsor(ns.lookup("expr")),
        sponsor(PEG.terminal("OF")),
        sponsor(PEG.plus(
          sponsor(PEG.sequence([
            sponsor(ns.lookup("ptrn")),
            sponsor(PEG.terminal(":")),
            sponsor(ns.lookup("expr"))
          ]))
        )),
        sponsor(PEG.terminal("END"))
      ])),
      sponsor(PEG.sequence([
        sponsor(ns.lookup("term")),
        sponsor(PEG.terminal(",")),
        sponsor(ns.lookup("expr"))
      ])),
      sponsor(ns.lookup("term"))
    ]))
  );

/*
term    <- 'NEW' term
         / const
         / call
         / '(' expr? ')'
         / ident
*/
  ns.define("term",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("NEW")),
        sponsor(ns.lookup("term"))
      ])),
      sponsor(ns.lookup("const")),
      sponsor(ns.lookup("call")),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("(")),
        sponsor(PEG.optional(
          sponsor(ns.lookup("expr"))
        )),
        sponsor(PEG.terminal(")"))
      ])),
      sponsor(ns.lookup("ident"))
    ]))
  );

/*
call    <- ident '(' expr? ')'
         / '(' expr ')' '(' expr? ')'
*/
  ns.define("call",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        sponsor(ns.lookup("ident")),
        sponsor(PEG.terminal("(")),
        sponsor(PEG.optional(
          sponsor(ns.lookup("expr"))
        )),
        sponsor(PEG.terminal(")"))
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("(")),
        sponsor(ns.lookup("expr")),
        sponsor(PEG.terminal(")")),
        sponsor(PEG.terminal("(")),
        sponsor(PEG.optional(
          sponsor(ns.lookup("expr"))
        )),
        sponsor(PEG.terminal(")"))
      ]))
    ]))
  );

/*
eqtn    <- ident '(' ptrn? ')' '=' expr
         / ptrn '=' ptrn
*/
  ns.define("eqtn",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        sponsor(ns.lookup("ident")),
        sponsor(PEG.terminal("(")),
        sponsor(PEG.optional(
          sponsor(ns.lookup("ptrn"))
        )),
        sponsor(PEG.terminal(")")),
        sponsor(PEG.terminal("=")),
        sponsor(ns.lookup("expr"))
      ])),
      sponsor(PEG.sequence([
        sponsor(ns.lookup("ptrn")),
        sponsor(PEG.terminal("=")),
        sponsor(ns.lookup("ptrn"))
      ]))
    ]))
  );

/*
ptrn    <- pterm ',' ptrn
         / pterm
*/
  ns.define("ptrn",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        sponsor(ns.lookup("pterm")),
        sponsor(PEG.terminal(",")),
        sponsor(ns.lookup("ptrn"))
      ])),
      sponsor(ns.lookup("pterm"))
    ]))
  );

/*
pterm   <- '_'
         / '$' term
         / '(' ptrn? ')'
         / const
         / ident
*/
  ns.define("pterm",
    sponsor(PEG.choice([
      sponsor(PEG.terminal("_")),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("$")),
        sponsor(ns.lookup("term"))
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("(")),
        sponsor(PEG.optional(
          sponsor(ns.lookup("ptrn"))
        )),
        sponsor(PEG.terminal(")"))
      ])),
      sponsor(ns.lookup("const")),
      sponsor(ns.lookup("ident"))
    ]))
  );

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
  ns.define("const",
    sponsor(PEG.choice([
      sponsor(ns.lookup("block")),
      sponsor(PEG.terminal("SELF")),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("\\")),
        sponsor(ns.lookup("ptrn")),
        sponsor(PEG.terminal(".")),
        sponsor(ns.lookup("expr"))
      ])),
      sponsor(ns.lookup("symbol")),
      sponsor(ns.lookup("number")),
      sponsor(ns.lookup("char")),
      sponsor(ns.lookup("string")),
      sponsor(PEG.terminal("NIL")),
      sponsor(PEG.terminal("TRUE")),
      sponsor(PEG.terminal("FALSE")),
      sponsor(PEG.terminal("?"))
    ]))
  );

/*
ident   <- { type:'ident' }
*/
  ns.define("ident",
    sponsor(PEG.object({
      "type": "ident"
    }))
  );

/*
number  <- { type:'number' }
*/
  ns.define("number",
    sponsor(PEG.object({
      "type": "number"
    }))
  );

/*
char    <- { type:'char' }
*/
  ns.define("char",
    sponsor(PEG.object({
      "type": "char"
    }))
  );

/*
string  <- { type:'string' }
*/
  ns.define("string",
    sponsor(PEG.object({
      "type": "string"
    }))
  );

/*
symbol  <- { type:'symbol' }
*/
  ns.define("symbol",
    sponsor(PEG.object({
      "type": "symbol"
    }))
  );

  return ns;  // return grammar namespace
};
