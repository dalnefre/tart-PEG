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
      ns.lookup("number"),
      ns.lookup("char"),
      ns.lookup("string"),
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

  ns.define("ident",
    ns.lookup("name")
  );

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
