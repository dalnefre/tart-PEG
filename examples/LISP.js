/* Generated PEG grammar */
"use strict";
var grammar = module.exports;

var PEG = require("../PEG.js");

grammar.build = function build(sponsor, log) {
  var pf = PEG.factory(sponsor);
  var ns = pf.namespace(log);

/*
sexpr   <- _ (list / atom)
*/
  ns.define("sexpr",
    pf.seq([
      ns.call("_"),
      pf.alt([
        ns.call("list"),
        ns.call("atom")
      ])
    ])
  );

/*
list    <- '(' sexpr* _ ')'
*/
  ns.define("list",
    pf.seq([
      pf.term("("),
      pf.star(
        ns.call("sexpr")
      ),
      ns.call("_"),
      pf.term(")")
    ])
  );

/*
atom    <- (number / symbol)
*/
  ns.define("atom",
    pf.alt([
      ns.call("number"),
      ns.call("symbol")
    ])
  );

/*
number  <- [0-9]+
*/
  ns.define("number",
    pf.plus(
      pf.if(function cond(token) {
        return /[0-9]/.test(token);
      })
    )
  );

/*
symbol  <- [-+a-zA-Z0-9!$%&*./:<=>?@\\^_|~]+
*/
  ns.define("symbol",
    pf.plus(
      pf.if(function cond(token) {
        return /[-+a-zA-Z0-9!$%&*./:<=>?@\\^_|~]/.test(token);
      })
    )
  );

/*
_       <- ([ \t-\r]+ / comment)*
*/
  ns.define("_",
    pf.star(
      pf.alt([
        pf.plus(
          pf.if(function cond(token) {
            return /[ \t-\r]/.test(token);
          })
        ),
        ns.call("comment")
      ])
    )
  );

/*
comment <- ';' (!eol .)*
*/
  ns.define("comment",
    pf.seq([
      pf.term(";"),
      pf.star(
        pf.seq([
          pf.not(
            ns.call("eol")
          ),
          pf.any
        ])
      )
    ])
  );

/*
eol     <- '\n' / '\r' '\n'?
*/
  ns.define("eol",
    pf.alt([
      pf.term("\n"),
      pf.seq([
        pf.term("\r"),
        pf.opt(
          pf.term("\n")
        )
      ])
    ])
  );

  return ns;  // return grammar namespace
};
