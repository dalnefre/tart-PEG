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
            sponsor(PEG.terminal(":")),
            ns.lookup("expr")
          ]))
        )),
        ns.lookup("END")
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
        ns.lookup("NEW"),
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
      ns.lookup("IGNORE"),
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
      ns.lookup("SELF"),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("\\")),
        ns.lookup("ptrn"),
        sponsor(PEG.terminal(".")),
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

  ns.define("LET",
    sponsor(PEG.object({
      "type": "name",
      "value": "LET"
    }))
  );

  ns.define("IN",
    sponsor(PEG.object({
      "type": "name",
      "value": "IN"
    }))
  );

  ns.define("AFTER",
    sponsor(PEG.object({
      "type": "name",
      "value": "AFTER"
    }))
  );

  ns.define("SEND",
    sponsor(PEG.object({
      "type": "name",
      "value": "SEND"
    }))
  );

  ns.define("TO",
    sponsor(PEG.object({
      "type": "name",
      "value": "TO"
    }))
  );

  ns.define("CREATE",
    sponsor(PEG.object({
      "type": "name",
      "value": "CREATE"
    }))
  );

  ns.define("WITH",
    sponsor(PEG.object({
      "type": "name",
      "value": "WITH"
    }))
  );

  ns.define("BECOME",
    sponsor(PEG.object({
      "type": "name",
      "value": "BECOME"
    }))
  );

  ns.define("THROW",
    sponsor(PEG.object({
      "type": "name",
      "value": "THROW"
    }))
  );

  ns.define("IF",
    sponsor(PEG.object({
      "type": "name",
      "value": "IF"
    }))
  );

  ns.define("ELIF",
    sponsor(PEG.object({
      "type": "name",
      "value": "ELIF"
    }))
  );

  ns.define("ELSE",
    sponsor(PEG.object({
      "type": "name",
      "value": "ELSE"
    }))
  );

  ns.define("CASE",
    sponsor(PEG.object({
      "type": "name",
      "value": "CASE"
    }))
  );

  ns.define("OF",
    sponsor(PEG.object({
      "type": "name",
      "value": "OF"
    }))
  );

  ns.define("END",
    sponsor(PEG.object({
      "type": "name",
      "value": "END"
    }))
  );

  ns.define("NEW",
    sponsor(PEG.object({
      "type": "name",
      "value": "NEW"
    }))
  );

  ns.define("SELF",
    sponsor(PEG.object({
      "type": "name",
      "value": "SELF"
    }))
  );

  ns.define("NIL",
    sponsor(PEG.object({
      "type": "name",
      "value": "NIL"
    }))
  );

  ns.define("UNDEF",
    sponsor(PEG.object({
      "type": "name",
      "value": "?"
    }))
  );

  ns.define("TRUE",
    sponsor(PEG.object({
      "type": "name",
      "value": "TRUE"
    }))
  );

  ns.define("FALSE",
    sponsor(PEG.object({
      "type": "name",
      "value": "FALSE"
    }))
  );

  ns.define("IGNORE",
    sponsor(PEG.object({
      "type": "name",
      "value": "_"
    }))
  );

  ns.define("ident",
    sponsor(PEG.object({
      "type": "name"
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
