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
      sponsor(PEG.terminal("[")),
      sponsor(PEG.star(
        ns.lookup("stmt")
      )),
      sponsor(PEG.terminal("]"))
    ]))
  );

  ns.define("stmt",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("LET")),
        ns.lookup("eqtn"),
        sponsor(PEG.not(
          sponsor(PEG.terminal("IN"))
        ))
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.optional(
          sponsor(PEG.sequence([
            sponsor(PEG.terminal("AFTER")),
            ns.lookup("expr")
          ]))
        )),
        sponsor(PEG.terminal("SEND")),
        ns.lookup("expr"),
        sponsor(PEG.terminal("TO")),
        ns.lookup("expr")
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("CREATE")),
        ns.lookup("ident"),
        sponsor(PEG.terminal("WITH")),
        ns.lookup("expr")
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("BECOME")),
        ns.lookup("expr")
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("THROW")),
        ns.lookup("expr")
      ])),
      ns.lookup("expr")
    ]))
  );

  ns.define("expr",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("LET")),
        ns.lookup("eqtn"),
        sponsor(PEG.terminal("IN")),
        ns.lookup("expr")
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("IF")),
        ns.lookup("eqtn"),
        ns.lookup("expr"),
        sponsor(PEG.star(
          sponsor(PEG.sequence([
            sponsor(PEG.terminal("ELIF")),
            ns.lookup("eqtn"),
            ns.lookup("expr")
          ]))
        )),
        sponsor(PEG.optional(
          sponsor(PEG.sequence([
            sponsor(PEG.terminal("ELSE")),
            ns.lookup("expr")
          ]))
        ))
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("CASE")),
        ns.lookup("expr"),
        sponsor(PEG.terminal("OF")),
        sponsor(PEG.plus(
          sponsor(PEG.sequence([
            ns.lookup("ptrn"),
            sponsor(PEG.terminal(":")),
            ns.lookup("expr")
          ]))
        )),
        sponsor(PEG.terminal("END"))
      ])),
      sponsor(PEG.sequence([
        ns.lookup("term"),
        sponsor(PEG.terminal(",")),
        ns.lookup("expr")
      ])),
      ns.lookup("term")
    ]))
  );

  ns.define("term",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("NEW")),
        ns.lookup("term")
      ])),
      ns.lookup("const"),
      ns.lookup("call"),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("(")),
        sponsor(PEG.optional(
          ns.lookup("expr")
        )),
        sponsor(PEG.terminal(")"))
      ])),
      ns.lookup("ident")
    ]))
  );

  ns.define("call",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        ns.lookup("ident"),
        sponsor(PEG.terminal("(")),
        sponsor(PEG.optional(
          ns.lookup("expr")
        )),
        sponsor(PEG.terminal(")"))
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("(")),
        ns.lookup("expr"),
        sponsor(PEG.terminal(")")),
        sponsor(PEG.terminal("(")),
        sponsor(PEG.optional(
          ns.lookup("expr")
        )),
        sponsor(PEG.terminal(")"))
      ]))
    ]))
  );

  ns.define("eqtn",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        ns.lookup("ident"),
        sponsor(PEG.terminal("(")),
        sponsor(PEG.optional(
          ns.lookup("ptrn")
        )),
        sponsor(PEG.terminal(")")),
        sponsor(PEG.terminal("=")),
        ns.lookup("expr")
      ])),
      sponsor(PEG.sequence([
        ns.lookup("ptrn"),
        sponsor(PEG.terminal("=")),
        ns.lookup("ptrn")
      ]))
    ]))
  );

  ns.define("ptrn",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        ns.lookup("pterm"),
        sponsor(PEG.terminal(",")),
        ns.lookup("ptrn")
      ])),
      ns.lookup("pterm")
    ]))
  );

  ns.define("pterm",
    sponsor(PEG.choice([
      sponsor(PEG.terminal("_")),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("$")),
        ns.lookup("term")
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("(")),
        sponsor(PEG.optional(
          ns.lookup("ptrn")
        )),
        sponsor(PEG.terminal(")"))
      ])),
      ns.lookup("const"),
      ns.lookup("ident")
    ]))
  );

  ns.define("const",
    sponsor(PEG.choice([
      ns.lookup("block"),
      sponsor(PEG.terminal("SELF")),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("\\")),
        ns.lookup("ptrn"),
        sponsor(PEG.terminal(".")),
        ns.lookup("expr")
      ])),
      ns.lookup("symbol"),
      ns.lookup("number"),
      ns.lookup("char"),
      ns.lookup("string"),
      sponsor(PEG.terminal("NIL")),
      sponsor(PEG.terminal("TRUE")),
      sponsor(PEG.terminal("FALSE")),
      sponsor(PEG.terminal("?"))
    ]))
  );

  ns.define("ident",
    sponsor(PEG.object({
      "type": "ident"
    }))
  );

  ns.define("number",
    sponsor(PEG.object({
      "type": "number"
    }))
  );

  ns.define("char",
    sponsor(PEG.object({
      "type": "char"
    }))
  );

  ns.define("string",
    sponsor(PEG.object({
      "type": "string"
    }))
  );

  ns.define("symbol",
    sponsor(PEG.object({
      "type": "symbol"
    }))
  );

  return ns;  // return grammar namespace
};
