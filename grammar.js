/* Generated PEG grammar */
"use strict";
var grammar = module.exports;

var PEG = require("./PEG.js");

grammar.build = function build(sponsor, log) {
  var ns = PEG.namespace(log);

/*
Grammar     <- _ Rule+ EOF
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
Rule        <- Name LEFTARROW Expression
*/
  ns.define("Rule",
    sponsor(PEG.sequence([
      sponsor(ns.lookup("Name")),
      sponsor(ns.lookup("LEFTARROW")),
      sponsor(ns.lookup("Expression"))
    ]))
  );

/*
Expression  <- Sequence (SLASH Sequence)*
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
Sequence    <- Prefix*
*/
  ns.define("Sequence",
    sponsor(PEG.star(
      sponsor(ns.lookup("Prefix"))
    ))
  );

/*
Prefix      <- (AND / NOT)? Suffix
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
Suffix      <- Primary (QUESTION / STAR / PLUS)?
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
Primary     <- Name !LEFTARROW
             / OPEN Expression CLOSE
             / Literal
             / Class
             / Object
             / DOT
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
Name        <- [a-zA-Z_] [a-zA-Z_0-9]* _
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
Literal     <- "\"" (!"\"" Character)+ "\"" _
             / "'" (!"'" Character)+ "'" _
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
Class       <- "[" (!"]" Range)+ "]" _
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
Range       <- Character "-" Character / Character
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
Character   <- "\\" [nrt'"\[\]\\]
             / "\\" "u" [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F]
             / !"\\" .
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
Object      <- LBRACE (Property (COMMA Property)*)? RBRACE
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
Property    <- Name COLON Literal
*/
  ns.define("Property",
    sponsor(PEG.sequence([
      sponsor(ns.lookup("Name")),
      sponsor(ns.lookup("COLON")),
      sponsor(ns.lookup("Literal"))
    ]))
  );

/*
DOT         <- "." _
*/
  ns.define("DOT",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal(".")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
LEFTARROW   <- "<" "-" _
*/
  ns.define("LEFTARROW",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("<")),
      sponsor(PEG.terminal("-")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
SLASH       <- "/" _
*/
  ns.define("SLASH",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("/")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
AND         <- "&" _
*/
  ns.define("AND",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("&")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
NOT         <- "!" _
*/
  ns.define("NOT",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("!")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
QUESTION    <- "?" _
*/
  ns.define("QUESTION",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("?")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
STAR        <- "*" _
*/
  ns.define("STAR",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("*")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
PLUS        <- "+" _
*/
  ns.define("PLUS",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("+")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
OPEN        <- "(" _
*/
  ns.define("OPEN",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("(")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
CLOSE       <- ")" _
*/
  ns.define("CLOSE",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal(")")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
LBRACE      <- "{" _
*/
  ns.define("LBRACE",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("{")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
RBRACE      <- "}" _
*/
  ns.define("RBRACE",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("}")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
COLON       <- ":" _
*/
  ns.define("COLON",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal(":")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
COMMA       <- "," _
*/
  ns.define("COMMA",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal(",")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
_           <- (Space / Comment)*   # optional whitespace
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
Comment     <- "#" (!EOL .)*
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
Space       <- [ \t-\r]
*/
  ns.define("Space",
    sponsor(PEG.predicate(function (token) {
      return /[ \t-\r]/.test(token);
    }))
  );

/*
EOL         <- "\n"
             / "\r" "\n"?
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
EOF         <- !.
*/
  ns.define("EOF",
    sponsor(PEG.not(
      sponsor(PEG.dot)
    ))
  );

  return ns;  // return grammar namespace
};
