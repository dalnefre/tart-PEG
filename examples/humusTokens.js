/* Generated PEG grammar */
"use strict";
var grammar = module.exports;

var PEG = require("../PEG.js");

grammar.build = function build(sponsor, log) {
  var ns = PEG.namespace(log);

/*
tokens  <- _ token* EOF
*/
  ns.define("tokens",
    sponsor(PEG.sequence([
      sponsor(ns.lookup("_")),
      sponsor(PEG.star(
        sponsor(ns.lookup("token"))
      )),
      sponsor(ns.lookup("EOF"))
    ]))
  );

/*
token   <- symbol
         / number
         / char
         / string
         / ident
         / punct
*/
  ns.define("token",
    sponsor(PEG.choice([
      sponsor(ns.lookup("symbol")),
      sponsor(ns.lookup("number")),
      sponsor(ns.lookup("char")),
      sponsor(ns.lookup("string")),
      sponsor(ns.lookup("ident")),
      sponsor(ns.lookup("punct"))
    ]))
  );

/*
symbol  <- '#' (punct / name)
*/
  ns.define("symbol",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("#")),
      sponsor(PEG.choice([
        sponsor(ns.lookup("punct")),
        sponsor(ns.lookup("name"))
      ]))
    ]))
  );

/*
number  <- '-'? [0-9]+ ('#' [0-9a-zA-Z]+)? _
*/
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
      sponsor(ns.lookup("_"))
    ]))
  );

/*
char    <- "'" (!"'" qchar) "'" _
*/
  ns.define("char",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("'")),
      sponsor(PEG.sequence([
        sponsor(PEG.not(
          sponsor(PEG.terminal("'"))
        )),
        sponsor(ns.lookup("qchar"))
      ])),
      sponsor(PEG.terminal("'")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
string  <- '"' (!'"' qchar)+ '"' _
*/
  ns.define("string",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("\"")),
      sponsor(PEG.plus(
        sponsor(PEG.sequence([
          sponsor(PEG.not(
            sponsor(PEG.terminal("\""))
          )),
          sponsor(ns.lookup("qchar"))
        ]))
      )),
      sponsor(PEG.terminal("\"")),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
qchar   <- '\\' [nrt'"\[\]\\]
         / '\\u' [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F]
         / !'\\' .
*/
  ns.define("qchar",
    sponsor(PEG.choice([
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("\\")),
        sponsor(PEG.predicate(function (token) {
          return /[nrt'\"\[\]\\]/.test(token);
        }))
      ])),
      sponsor(PEG.sequence([
        sponsor(PEG.terminal("\\u")),
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
ident   <- name
*/
  ns.define("ident",
    sponsor(ns.lookup("name"))
  );

/*
name    <- [-0-9a-zA-Z!%&'*+/?@^_~]+ _
*/
  ns.define("name",
    sponsor(PEG.sequence([
      sponsor(PEG.plus(
        sponsor(PEG.predicate(function (token) {
          return /[-0-9a-zA-Z!%&'*+/?@^_~]/.test(token);
        }))
      )),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
punct   <- [#$(),.:;=\[\\\]] _
*/
  ns.define("punct",
    sponsor(PEG.sequence([
      sponsor(PEG.predicate(function (token) {
        return /[#$(),.:;=\[\\\]]/.test(token);
      })),
      sponsor(ns.lookup("_"))
    ]))
  );

/*
_       <- &punct                           # token boundary
         / (space / comment)*
*/
  ns.define("_",
    sponsor(PEG.choice([
      sponsor(PEG.follow(
        sponsor(ns.lookup("punct"))
      )),
      sponsor(PEG.star(
        sponsor(PEG.choice([
          sponsor(ns.lookup("space")),
          sponsor(ns.lookup("comment"))
        ]))
      ))
    ]))
  );

/*
comment <- '#' space (!EOL .)*
*/
  ns.define("comment",
    sponsor(PEG.sequence([
      sponsor(PEG.terminal("#")),
      sponsor(ns.lookup("space")),
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
space   <- [ \t-\r]
*/
  ns.define("space",
    sponsor(PEG.predicate(function (token) {
      return /[ \t-\r]/.test(token);
    }))
  );

/*
EOL     <- '\n'
         / '\r' '\n'?
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
EOF     <- !.
*/
  ns.define("EOF",
    sponsor(PEG.not(
      sponsor(PEG.dot)
    ))
  );

  return ns;  // return grammar namespace
};
