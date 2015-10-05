/* Generated PEG grammar */
"use strict";
var grammar = module.exports;

var PEG = require("../index.js");
var named = require("../named.js");

grammar.build = function build(sponsor) {
  var ns = named.scope(sponsor);

  ns.define("humus",
    sponsor(PEG.plus(
      ns.lookup("stmt")
    ))
  );

  ns.define("block",
    sponsor(PEG.sequence([
      ns.lookup("LBRACK"),
      sponsor(PEG.star(
        ns.lookup("stmt")
      )),
      ns.lookup("RBRACK")
    ]))
  );

  ns.define("stmt",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        ns.lookup("LET"),
        ns.lookup("eqtn"),
        sponsor(PEG.not(
          ns.lookup("IN")
        ))
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.optional(
          sponsor(PEG.sequence([
            ns.lookup("AFTER"),
            ns.lookup("expr")
          ]))
        )),
        ns.lookup("SEND"),
        ns.lookup("expr"),
        ns.lookup("TO"),
        ns.lookup("expr")
      ])),
      sponsor(PEG.sequence([
        ns.lookup("CREATE"),
        ns.lookup("ident"),
        ns.lookup("WITH"),
        ns.lookup("expr")
      ])),
      sponsor(PEG.sequence([
        ns.lookup("BECOME"),
        ns.lookup("expr")
      ])),
      sponsor(PEG.sequence([
        ns.lookup("THROW"),
        ns.lookup("expr")
      ])),
      ns.lookup("expr")
    ]))
  );

  ns.define("expr",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        ns.lookup("LET"),
        ns.lookup("eqtn"),
        ns.lookup("IN"),
        ns.lookup("expr")
      ])),
      sponsor(PEG.sequence([
        ns.lookup("IF"),
        ns.lookup("eqtn"),
        ns.lookup("expr"),
        sponsor(PEG.star(
          sponsor(PEG.sequence([
            ns.lookup("ELIF"),
            ns.lookup("eqtn"),
            ns.lookup("expr")
          ]))
        )),
        sponsor(PEG.optional(
          sponsor(PEG.sequence([
            ns.lookup("ELSE"),
            ns.lookup("expr")
          ]))
        ))
      ])),
      sponsor(PEG.sequence([
        ns.lookup("CASE"),
        ns.lookup("expr"),
        ns.lookup("OF"),
        sponsor(PEG.plus(
          sponsor(PEG.sequence([
            ns.lookup("ptrn"),
            ns.lookup("COLON"),
            ns.lookup("expr")
          ]))
        )),
        ns.lookup("END")
      ])),
      sponsor(PEG.sequence([
        ns.lookup("term"),
        ns.lookup("COMMA"),
        ns.lookup("expr")
      ])),
      ns.lookup("term")
    ]))
  );

  ns.define("term",
    sponsor(PEG.choice([
      ns.lookup("const"),
      ns.lookup("call"),
      ns.lookup("ident"),
      sponsor(PEG.sequence([
        ns.lookup("NEW"),
        ns.lookup("term")
      ])),
      sponsor(PEG.sequence([
        ns.lookup("LPAREN"),
        sponsor(PEG.optional(
          ns.lookup("expr")
        )),
        ns.lookup("RPAREN")
      ]))
    ]))
  );

  ns.define("call",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        ns.lookup("ident"),
        ns.lookup("LPAREN"),
        sponsor(PEG.optional(
          ns.lookup("expr")
        )),
        ns.lookup("RPAREN")
      ])),
      sponsor(PEG.sequence([
        ns.lookup("LPAREN"),
        ns.lookup("expr"),
        ns.lookup("RPAREN"),
        ns.lookup("LPAREN"),
        sponsor(PEG.optional(
          ns.lookup("expr")
        )),
        ns.lookup("RPAREN")
      ]))
    ]))
  );

  ns.define("eqtn",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        ns.lookup("ident"),
        ns.lookup("LPAREN"),
        sponsor(PEG.optional(
          ns.lookup("ptrn")
        )),
        ns.lookup("RPAREN"),
        ns.lookup("EQUAL"),
        ns.lookup("expr")
      ])),
      sponsor(PEG.sequence([
        ns.lookup("ptrn"),
        ns.lookup("EQUAL"),
        ns.lookup("ptrn")
      ]))
    ]))
  );

  ns.define("ptrn",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        ns.lookup("pterm"),
        ns.lookup("COMMA"),
        ns.lookup("ptrn")
      ])),
      ns.lookup("pterm")
    ]))
  );

  ns.define("pterm",
    sponsor(PEG.choice([
      ns.lookup("IGNORE"),
      ns.lookup("const"),
      ns.lookup("ident"),
      sponsor(PEG.sequence([
        ns.lookup("VALUE"),
        ns.lookup("term")
      ])),
      sponsor(PEG.sequence([
        ns.lookup("LPAREN"),
        sponsor(PEG.optional(
          ns.lookup("ptrn")
        )),
        ns.lookup("RPAREN")
      ]))
    ]))
  );

  ns.define("const",
    sponsor(PEG.choice([
      ns.lookup("block"),
      ns.lookup("SELF"),
      sponsor(PEG.sequence([
        ns.lookup("LAMBDA"),
        ns.lookup("ptrn"),
        ns.lookup("DOT"),
        ns.lookup("expr")
      ])),
      ns.lookup("number"),
      ns.lookup("char"),
      ns.lookup("string"),
      ns.lookup("UNDEF"),
      ns.lookup("NIL"),
      ns.lookup("TRUE"),
      ns.lookup("FALSE"),
      ns.lookup("symbol")
    ]))
  );

  return ns;  // return grammar namespace
};
