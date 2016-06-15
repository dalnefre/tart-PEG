/* Generated PEG grammar */
"use strict";
var grammar = module.exports;

var PEG = require("../PEG.js");

grammar.build = function build(sponsor, log) {
  var pf = PEG.factory(sponsor);
  var ns = pf.namespace(log);

/*
humus   <- stmt+
*/
  ns.define("humus",
    pf.plus(
      ns.call("stmt")
    )
  );

/*
block   <- '[' stmt* ']'
*/
  ns.define("block",
    pf.seq([
      pf.term("["),
      pf.star(
        ns.call("stmt")
      ),
      pf.term("]")
    ])
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
    pf.alt([
      pf.seq([
        pf.term("LET"),
        ns.call("eqtn"),
        pf.not(
          pf.term("IN")
        )
      ]),
      pf.seq([
        pf.opt(
          pf.seq([
            pf.term("AFTER"),
            ns.call("expr")
          ])
        ),
        pf.term("SEND"),
        ns.call("expr"),
        pf.term("TO"),
        ns.call("expr")
      ]),
      pf.seq([
        pf.term("CREATE"),
        ns.call("ident"),
        pf.term("WITH"),
        ns.call("expr")
      ]),
      pf.seq([
        pf.term("BECOME"),
        ns.call("expr")
      ]),
      pf.seq([
        pf.term("THROW"),
        ns.call("expr")
      ]),
      ns.call("expr")
    ])
  );

/*
expr    <- 'LET' eqtn 'IN' expr
         / 'IF' eqtn expr ('ELIF' eqtn expr)* ('ELSE' expr)?
         / 'CASE' expr 'OF' (ptrn ':' expr)+ 'END'
         / term ',' expr
         / term
*/
  ns.define("expr",
    pf.alt([
      pf.seq([
        pf.term("LET"),
        ns.call("eqtn"),
        pf.term("IN"),
        ns.call("expr")
      ]),
      pf.seq([
        pf.term("IF"),
        ns.call("eqtn"),
        ns.call("expr"),
        pf.star(
          pf.seq([
            pf.term("ELIF"),
            ns.call("eqtn"),
            ns.call("expr")
          ])
        ),
        pf.opt(
          pf.seq([
            pf.term("ELSE"),
            ns.call("expr")
          ])
        )
      ]),
      pf.seq([
        pf.term("CASE"),
        ns.call("expr"),
        pf.term("OF"),
        pf.plus(
          pf.seq([
            ns.call("ptrn"),
            pf.term(":"),
            ns.call("expr")
          ])
        ),
        pf.term("END")
      ]),
      pf.seq([
        ns.call("term"),
        pf.term(","),
        ns.call("expr")
      ]),
      ns.call("term")
    ])
  );

/*
term    <- 'NEW' term
         / const
         / call
         / '(' expr? ')'
         / ident
*/
  ns.define("term",
    pf.alt([
      pf.seq([
        pf.term("NEW"),
        ns.call("term")
      ]),
      ns.call("const"),
      ns.call("call"),
      pf.seq([
        pf.term("("),
        pf.opt(
          ns.call("expr")
        ),
        pf.term(")")
      ]),
      ns.call("ident")
    ])
  );

/*
call    <- ident '(' expr? ')'
         / '(' expr ')' '(' expr? ')'
*/
  ns.define("call",
    pf.alt([
      pf.seq([
        ns.call("ident"),
        pf.term("("),
        pf.opt(
          ns.call("expr")
        ),
        pf.term(")")
      ]),
      pf.seq([
        pf.term("("),
        ns.call("expr"),
        pf.term(")"),
        pf.term("("),
        pf.opt(
          ns.call("expr")
        ),
        pf.term(")")
      ])
    ])
  );

/*
eqtn    <- ident '(' ptrn? ')' '=' expr
         / ptrn '=' ptrn
*/
  ns.define("eqtn",
    pf.alt([
      pf.seq([
        ns.call("ident"),
        pf.term("("),
        pf.opt(
          ns.call("ptrn")
        ),
        pf.term(")"),
        pf.term("="),
        ns.call("expr")
      ]),
      pf.seq([
        ns.call("ptrn"),
        pf.term("="),
        ns.call("ptrn")
      ])
    ])
  );

/*
ptrn    <- pterm ',' ptrn
         / pterm
*/
  ns.define("ptrn",
    pf.alt([
      pf.seq([
        ns.call("pterm"),
        pf.term(","),
        ns.call("ptrn")
      ]),
      ns.call("pterm")
    ])
  );

/*
pterm   <- '_'
         / '$' term
         / '(' ptrn? ')'
         / const
         / ident
*/
  ns.define("pterm",
    pf.alt([
      pf.term("_"),
      pf.seq([
        pf.term("$"),
        ns.call("term")
      ]),
      pf.seq([
        pf.term("("),
        pf.opt(
          ns.call("ptrn")
        ),
        pf.term(")")
      ]),
      ns.call("const"),
      ns.call("ident")
    ])
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
    pf.alt([
      ns.call("block"),
      pf.term("SELF"),
      pf.seq([
        pf.term("\\"),
        ns.call("ptrn"),
        pf.term("."),
        ns.call("expr")
      ]),
      ns.call("symbol"),
      ns.call("number"),
      ns.call("char"),
      ns.call("string"),
      pf.term("NIL"),
      pf.term("TRUE"),
      pf.term("FALSE"),
      pf.term("?")
    ])
  );

/*
ident   <- { type:'ident' }
*/
  ns.define("ident",
    pf.object({
      "type": "ident"
    })
  );

/*
number  <- { type:'number' }
*/
  ns.define("number",
    pf.object({
      "type": "number"
    })
  );

/*
char    <- { type:'char' }
*/
  ns.define("char",
    pf.object({
      "type": "char"
    })
  );

/*
string  <- { type:'string' }
*/
  ns.define("string",
    pf.object({
      "type": "string"
    })
  );

/*
symbol  <- { type:'symbol' }
*/
  ns.define("symbol",
    pf.object({
      "type": "symbol"
    })
  );

  return ns;  // return grammar namespace
};
