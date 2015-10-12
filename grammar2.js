/* Generated PEG grammar */
"use strict";
var grammar = module.exports;

var PEG = require("./PEG.js");
var input = require("./input.js");

grammar.build = function build(sponsor, log) {
  var ns = PEG.namespace(log);

/*
*/
  ns.define("Grammar",
    sponsor(PEG.sequence([
      sponsor(ns.lookup("_")),
      sponsor(PEG.plus(
        sponsor(ns.lookup("Rule"))
      )),
      sponsor(ns.lookup("EOF"))
    ]))
  );

/*
*/
  ns.define("Rule",
    sponsor(PEG.sequence([
      sponsor(ns.lookup("Name")),
      sponsor(ns.lookup("LEFTARROW")),
      sponsor(ns.lookup("Expression"))
    ]))
  );

/*
*/
  ns.define("Expression",
    sponsor(PEG.sequence([
      sponsor(ns.lookup("Sequence")),
      sponsor(PEG.star(
        sponsor(PEG.sequence([
          sponsor(ns.lookup("SLASH")),
          sponsor(ns.lookup("Sequence"))
        ]))
      ))
    ]))
  );

/*
*/
  ns.define("Sequence",
    sponsor(PEG.star(
      sponsor(ns.lookup("Prefix"))
    ))
  );

/*
*/
  ns.define("Prefix",
    sponsor(PEG.sequence([
      sponsor(PEG.optional(
        sponsor(PEG.choice([
          sponsor(ns.lookup("AND")),
          sponsor(ns.lookup("NOT"))
        ]))
      )),
      sponsor(ns.lookup("Suffix"))
    ]))
  );

/*
*/
  ns.define("Suffix",
    sponsor(PEG.sequence([
      sponsor(ns.lookup("Primary")),
      sponsor(PEG.optional(
        sponsor(PEG.choice([
          sponsor(ns.lookup("QUESTION")),
          sponsor(ns.lookup("STAR")),
          sponsor(ns.lookup("PLUS"))
        ]))
      ))
    ]))
  );

/*
*/
  ns.define("Primary",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        sponsor(ns.lookup("Name")),
        sponsor(PEG.not(
          sponsor(ns.lookup("LEFTARROW"))
        ))
      ])),
      sponsor(PEG.sequence([
        sponsor(ns.lookup("OPEN")),
        sponsor(ns.lookup("Expression")),
        sponsor(ns.lookup("CLOSE"))
      ])),
      sponsor(ns.lookup("Literal")),
      sponsor(ns.lookup("Class")),
      sponsor(ns.lookup("Object")),
      sponsor(ns.lookup("DOT"))
    ]))
  );

/*
*/
  ns.define("Name",
    sponsor(PEG.sequence([
      sponsor(PEG.predicate(function (token) {
        return /[a-zA-Z_]/.test(token);
      })),
      sponsor(PEG.star(
        sponsor(PEG.predicate(function (token) {
          return /[a-zA-Z_0-9]/.test(token);
        }))
      )),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
*/
  ns.define("Literal",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("\"")),
        sponsor(PEG.plus(
          sponsor(PEG.sequence([
            sponsor(PEG.not(
              sponsor(PEG.terminal("\""))
            )),
            sponsor(ns.lookup("Character"))
          ]))
        )),
        sponsor(PEG.terminal("\"")),
        sponsor(ns.lookup("_"))
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("'")),
        sponsor(PEG.plus(
          sponsor(PEG.sequence([
            sponsor(PEG.not(
              sponsor(PEG.terminal("'"))
            )),
            sponsor(ns.lookup("Character"))
          ]))
        )),
        sponsor(PEG.terminal("'")),
        sponsor(ns.lookup("_"))
      ]))
    ]))
  );

/*
*/
  ns.define("Class",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("[")),
      sponsor(PEG.plus(
        sponsor(PEG.sequence([
          sponsor(PEG.not(
            sponsor(PEG.terminal("]"))
          )),
          sponsor(ns.lookup("Range"))
        ]))
      )),
      sponsor(PEG.terminal("]")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
*/
  ns.define("Range",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        sponsor(ns.lookup("Character")),
        sponsor(PEG.terminal("-")),
        sponsor(ns.lookup("Character"))
      ])),
      sponsor(ns.lookup("Character"))
    ]))
  );

/*
*/
  ns.define("Character",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("\\")),
        sponsor(PEG.predicate(function (token) {
          return /[nrt'\"\[\]\\]/.test(token);
        }))
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("\\")),
        sponsor(PEG.terminal("u")),
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

/*
*/
  ns.define("Object",
    sponsor(PEG.sequence([
      sponsor(ns.lookup("LBRACE")),
      sponsor(PEG.optional(
        sponsor(PEG.sequence([
          sponsor(ns.lookup("Property")),
          sponsor(PEG.star(
            sponsor(PEG.sequence([
              sponsor(ns.lookup("COMMA")),
              sponsor(ns.lookup("Property"))
            ]))
          ))
        ]))
      )),
      sponsor(ns.lookup("RBRACE"))
    ]))
  );

/*
*/
  ns.define("Property",
    sponsor(PEG.sequence([
      sponsor(ns.lookup("Name")),
      sponsor(ns.lookup("COLON")),
      sponsor(ns.lookup("Literal"))
    ]))
  );

/*
*/
  ns.define("DOT",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal(".")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
*/
  ns.define("LEFTARROW",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("<")),
      sponsor(PEG.terminal("-")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
*/
  ns.define("SLASH",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("/")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
*/
  ns.define("AND",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("&")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
*/
  ns.define("NOT",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("!")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
*/
  ns.define("QUESTION",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("?")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
*/
  ns.define("STAR",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("*")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
*/
  ns.define("PLUS",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("+")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
*/
  ns.define("OPEN",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("(")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
*/
  ns.define("CLOSE",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal(")")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
*/
  ns.define("LBRACE",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("{")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
*/
  ns.define("RBRACE",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("}")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
*/
  ns.define("COLON",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal(":")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
*/
  ns.define("COMMA",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal(",")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
*/
  ns.define("_",
    sponsor(PEG.star(
      sponsor(PEG.choice([
        sponsor(ns.lookup("Space")),
        sponsor(ns.lookup("Comment"))
      ]))
    ))
  );

/*
*/
  ns.define("Comment",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("#")),
      sponsor(PEG.star(
        sponsor(PEG.sequence([
          sponsor(PEG.not(
            sponsor(ns.lookup("EOL"))
          )),
          sponsor(PEG.dot)
        ]))
      ))
    ]))
  );

/*
*/
  ns.define("Space",
    sponsor(PEG.predicate(function (token) {
      return /[ \t-\r]/.test(token);
    }))
  );

/*
*/
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

/*
*/
  ns.define("EOF",
    sponsor(PEG.not(
      sponsor(PEG.dot)
    ))
  );

  return ns;  // return grammar namespace
};
