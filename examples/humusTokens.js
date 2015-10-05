/* Generated PEG grammar */
"use strict";
var grammar = module.exports;

var PEG = require("../index.js");
var named = require("../named.js");

grammar.build = function build(sponsor) {
  var ns = named.scope(sponsor);

  ns.define("tokens",
    sponsor(PEG.sequence([
      ns.lookup("_"),
      sponsor(PEG.star(
        ns.lookup("token")
      )),
      ns.lookup("EOF")
    ]))
  );

  ns.define("token",
    sponsor(PEG.choice([
      ns.lookup("symbol"),
//      ns.lookup("keyword"),
//      ns.lookup("const"),
//      ns.lookup("boolean"),
      ns.lookup("number"),
      ns.lookup("char"),
      ns.lookup("string"),
//      ns.lookup("IGNORE"),
      ns.lookup("ident"),
      ns.lookup("punct")
    ]))
  );

  ns.define("symbol",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("#")),
      sponsor(PEG.choice([
        ns.lookup("punct"),
        ns.lookup("name")
      ]))
    ]))
  );

  ns.define("keyword",
    sponsor(PEG.choice([
      ns.lookup("LET"),
      ns.lookup("IN"),
      ns.lookup("AFTER"),
      ns.lookup("SEND"),
      ns.lookup("TO"),
      ns.lookup("CREATE"),
      ns.lookup("WITH"),
      ns.lookup("BECOME"),
      ns.lookup("THROW"),
      ns.lookup("IF"),
      ns.lookup("ELIF"),
      ns.lookup("ELSE"),
      ns.lookup("CASE"),
      ns.lookup("OF"),
      ns.lookup("END"),
      ns.lookup("NEW")
    ]))
  );

  ns.define("LET",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("L")),
      sponsor(PEG.terminal("E")),
      sponsor(PEG.terminal("T")),
      ns.lookup("_")
    ]))
  );

  ns.define("IN",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("I")),
      sponsor(PEG.terminal("N")),
      ns.lookup("_")
    ]))
  );

  ns.define("AFTER",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("A")),
      sponsor(PEG.terminal("F")),
      sponsor(PEG.terminal("T")),
      sponsor(PEG.terminal("E")),
      sponsor(PEG.terminal("R")),
      ns.lookup("_")
    ]))
  );

  ns.define("SEND",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("S")),
      sponsor(PEG.terminal("E")),
      sponsor(PEG.terminal("N")),
      sponsor(PEG.terminal("D")),
      ns.lookup("_")
    ]))
  );

  ns.define("TO",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("T")),
      sponsor(PEG.terminal("O")),
      ns.lookup("_")
    ]))
  );

  ns.define("CREATE",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("C")),
      sponsor(PEG.terminal("R")),
      sponsor(PEG.terminal("E")),
      sponsor(PEG.terminal("A")),
      sponsor(PEG.terminal("T")),
      sponsor(PEG.terminal("E")),
      ns.lookup("_")
    ]))
  );

  ns.define("WITH",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("W")),
      sponsor(PEG.terminal("I")),
      sponsor(PEG.terminal("T")),
      sponsor(PEG.terminal("H")),
      ns.lookup("_")
    ]))
  );

  ns.define("BECOME",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("B")),
      sponsor(PEG.terminal("E")),
      sponsor(PEG.terminal("C")),
      sponsor(PEG.terminal("O")),
      sponsor(PEG.terminal("M")),
      sponsor(PEG.terminal("E")),
      ns.lookup("_")
    ]))
  );

  ns.define("THROW",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("T")),
      sponsor(PEG.terminal("H")),
      sponsor(PEG.terminal("R")),
      sponsor(PEG.terminal("O")),
      sponsor(PEG.terminal("W")),
      ns.lookup("_")
    ]))
  );

  ns.define("IF",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("I")),
      sponsor(PEG.terminal("F")),
      ns.lookup("_")
    ]))
  );

  ns.define("ELIF",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("E")),
      sponsor(PEG.terminal("L")),
      sponsor(PEG.terminal("I")),
      sponsor(PEG.terminal("F")),
      ns.lookup("_")
    ]))
  );

  ns.define("ELSE",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("E")),
      sponsor(PEG.terminal("L")),
      sponsor(PEG.terminal("S")),
      sponsor(PEG.terminal("E")),
      ns.lookup("_")
    ]))
  );

  ns.define("CASE",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("C")),
      sponsor(PEG.terminal("A")),
      sponsor(PEG.terminal("S")),
      sponsor(PEG.terminal("E")),
      ns.lookup("_")
    ]))
  );

  ns.define("OF",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("O")),
      sponsor(PEG.terminal("F")),
      ns.lookup("_")
    ]))
  );

  ns.define("END",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("E")),
      sponsor(PEG.terminal("N")),
      sponsor(PEG.terminal("D")),
      ns.lookup("_")
    ]))
  );

  ns.define("NEW",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("N")),
      sponsor(PEG.terminal("E")),
      sponsor(PEG.terminal("W")),
      ns.lookup("_")
    ]))
  );

  ns.define("const",
    sponsor(PEG.choice([
      ns.lookup("SELF"),
      ns.lookup("NIL"),
      ns.lookup("UNDEF")
    ]))
  );

  ns.define("SELF",
    sponsor(PEG.sequence([
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("S")),
        sponsor(PEG.terminal("E")),
        sponsor(PEG.terminal("L")),
        sponsor(PEG.terminal("F"))
      ])),
      ns.lookup("_")
    ]))
  );

  ns.define("NIL",
    sponsor(PEG.sequence([
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("N")),
        sponsor(PEG.terminal("I")),
        sponsor(PEG.terminal("L"))
      ])),
      ns.lookup("_")
    ]))
  );

  ns.define("UNDEF",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("?")),
      ns.lookup("_")
    ]))
  );

  ns.define("boolean",
    sponsor(PEG.choice([
      ns.lookup("TRUE"),
      ns.lookup("FALSE")
    ]))
  );

  ns.define("TRUE",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("T")),
      sponsor(PEG.terminal("R")),
      sponsor(PEG.terminal("U")),
      sponsor(PEG.terminal("E")),
      ns.lookup("_")
    ]))
  );

  ns.define("FALSE",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("F")),
      sponsor(PEG.terminal("A")),
      sponsor(PEG.terminal("L")),
      sponsor(PEG.terminal("S")),
      sponsor(PEG.terminal("E")),
      ns.lookup("_")
    ]))
  );

  ns.define("number",
    sponsor(PEG.sequence([
      sponsor(PEG.optional(
        sponsor(PEG.terminal("-"))
      )),
      sponsor(PEG.plus(
        sponsor(PEG.predicate(function (token) {
          return /[0-9]/.test(token);
        }))
      )),
      sponsor(PEG.optional(
        sponsor(PEG.sequence([
          sponsor(PEG.terminal("#")),
          sponsor(PEG.plus(
            sponsor(PEG.predicate(function (token) {
              return /[0-9a-zA-Z]/.test(token);
            }))
          ))
        ]))
      )),
      ns.lookup("_")
    ]))
  );

  ns.define("char",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("'")),
      sponsor(PEG.sequence([
        sponsor(PEG.not(
          sponsor(PEG.terminal("'"))
        )),
        ns.lookup("qchar")
      ])),
      sponsor(PEG.terminal("'")),
      ns.lookup("_")
    ]))
  );

  ns.define("string",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("\"")),
      sponsor(PEG.plus(
        sponsor(PEG.sequence([
          sponsor(PEG.not(
            sponsor(PEG.terminal("\""))
          )),
          ns.lookup("qchar")
        ]))
      )),
      sponsor(PEG.terminal("\"")),
      ns.lookup("_")
    ]))
  );

  ns.define("qchar",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("\\")),
        sponsor(PEG.predicate(function (token) {
          return /[nrt'\"\[\]\\]/.test(token);
        }))
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.sequence([
          sponsor(PEG.terminal("\\")),
          sponsor(PEG.terminal("u"))
        ])),
        sponsor(PEG.predicate(function (token) {
          return /[0-9a-fA-F]/.test(token);
        })),
        sponsor(PEG.predicate(function (token) {
          return /[0-9a-fA-F]/.test(token);
        })),
        sponsor(PEG.predicate(function (token) {
          return /[0-9a-fA-F]/.test(token);
        })),
        sponsor(PEG.predicate(function (token) {
          return /[0-9a-fA-F]/.test(token);
        }))
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.not(
          sponsor(PEG.terminal("\\"))
        )),
        sponsor(PEG.dot)
      ]))
    ]))
  );

  ns.define("ident", ns.lookup("name"));

  ns.define("name",
    sponsor(PEG.sequence([
      sponsor(PEG.plus(
        sponsor(PEG.predicate(function (token) {
          return /[-0-9a-zA-Z!%&'*+/?@^_~]/.test(token);
        }))
      )),
      ns.lookup("_")
    ]))
  );

  ns.define("punct",
    sponsor(PEG.sequence([
      sponsor(PEG.predicate(function (token) {
        return /[#$(),.:;=\[\\\]]/.test(token);
      })),
      ns.lookup("_")
    ]))
  );

  ns.define("IGNORE",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("_")),
      ns.lookup("_")
    ]))
  );

  ns.define("LBRACK",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("[")),
      ns.lookup("_")
    ]))
  );

  ns.define("RBRACK",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("]")),
      ns.lookup("_")
    ]))
  );

  ns.define("COLON",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal(":")),
      ns.lookup("_")
    ]))
  );

  ns.define("COMMA",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal(",")),
      ns.lookup("_")
    ]))
  );

  ns.define("LPAREN",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("(")),
      ns.lookup("_")
    ]))
  );

  ns.define("RPAREN",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal(")")),
      ns.lookup("_")
    ]))
  );

  ns.define("EQUAL",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("=")),
      ns.lookup("_")
    ]))
  );

  ns.define("VALUE",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("$")),
      ns.lookup("_")
    ]))
  );

  ns.define("LAMBDA",
    sponsor(PEG.sequence([
      sponsor(PEG.predicate(function (token) {
        return /[\\]/.test(token);
      })),
      ns.lookup("_")
    ]))
  );

  ns.define("DOT",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal(".")),
      ns.lookup("_")
    ]))
  );

  ns.define("_",
    sponsor(PEG.choice([
      sponsor(PEG.follow(
        ns.lookup("punct")
      )),
      sponsor(PEG.star(
        sponsor(PEG.choice([
          ns.lookup("space"),
          ns.lookup("comment")
        ]))
      ))
    ]))
  );

  ns.define("comment",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("#")),
      ns.lookup("space"),
      sponsor(PEG.star(
        sponsor(PEG.sequence([
          sponsor(PEG.not(
            ns.lookup("EOL")
          )),
          sponsor(PEG.dot)
        ]))
      ))
    ]))
  );

  ns.define("space",
    sponsor(PEG.predicate(function (token) {
      return /[ \t-\r]/.test(token);
    }))
  );

  ns.define("EOL",
    sponsor(PEG.choice([
      sponsor(PEG.terminal("\n")),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("\r")),
        sponsor(PEG.optional(
          sponsor(PEG.terminal("\n"))
        ))
      ]))
    ]))
  );

  ns.define("EOF",
    sponsor(PEG.not(
      sponsor(PEG.dot)
    ))
  );

  return ns;  // return grammar namespace
};
