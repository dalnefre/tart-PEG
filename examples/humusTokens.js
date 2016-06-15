/* Generated PEG grammar */
"use strict";
var grammar = module.exports;

var PEG = require("../PEG.js");

grammar.build = function build(sponsor, log) {
  var pf = PEG.factory(sponsor);
  var ns = pf.namespace(log);

/*
tokens  <- _ token* EOF
*/
  ns.define("tokens",
    pf.seq([
      ns.call("_"),
      pf.star(
        ns.call("token")
      ),
      ns.call("EOF")
    ])
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
    pf.alt([
      ns.call("symbol"),
      ns.call("number"),
      ns.call("char"),
      ns.call("string"),
      ns.call("ident"),
      ns.call("punct")
    ])
  );

/*
symbol  <- '#' (punct / name)
*/
  ns.define("symbol",
    pf.seq([
      pf.term("#"),
      pf.alt([
        ns.call("punct"),
        ns.call("name")
      ])
    ])
  );

/*
number  <- '-'? [0-9]+ ('#' [0-9a-zA-Z]+)? _
*/
  ns.define("number",
    pf.seq([
      pf.opt(
        pf.term("-")
      ),
      pf.plus(
        pf.if(function cond(token) {
          return /[0-9]/.test(token);
        })
      ),
      pf.opt(
        pf.seq([
          pf.term("#"),
          pf.plus(
            pf.if(function cond(token) {
              return /[0-9a-zA-Z]/.test(token);
            })
          )
        ])
      ),
      ns.call("_")
    ])
  );

/*
char    <- "'" (!"'" qchar) "'" _
*/
  ns.define("char",
    pf.seq([
      pf.term("'"),
      pf.seq([
        pf.not(
          pf.term("'")
        ),
        ns.call("qchar")
      ]),
      pf.term("'"),
      ns.call("_")
    ])
  );

/*
string  <- '"' (!'"' qchar)+ '"' _
*/
  ns.define("string",
    pf.seq([
      pf.term("\""),
      pf.plus(
        pf.seq([
          pf.not(
            pf.term("\"")
          ),
          ns.call("qchar")
        ])
      ),
      pf.term("\""),
      ns.call("_")
    ])
  );

/*
qchar   <- '\\' [nrt'"\[\]\\]
         / '\\u' [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F]
         / !'\\' .
*/
  ns.define("qchar",
    pf.alt([
      pf.seq([
        pf.term("\\"),
        pf.if(function cond(token) {
          return /[nrt'\"\[\]\\]/.test(token);
        })
      ]),
      pf.seq([
        pf.term("\\u"),
        pf.if(function cond(token) {
          return /[0-9a-fA-F]/.test(token);
        }),
        pf.if(function cond(token) {
          return /[0-9a-fA-F]/.test(token);
        }),
        pf.if(function cond(token) {
          return /[0-9a-fA-F]/.test(token);
        }),
        pf.if(function cond(token) {
          return /[0-9a-fA-F]/.test(token);
        })
      ]),
      pf.seq([
        pf.not(
          pf.term("\\")
        ),
        pf.any
      ])
    ])
  );

/*
ident   <- name
*/
  ns.define("ident",
    ns.call("name")
  );

/*
name    <- [-0-9a-zA-Z!%&'*+/?@^_~]+ _
*/
  ns.define("name",
    pf.seq([
      pf.plus(
        pf.if(function cond(token) {
          return /[-0-9a-zA-Z!%&'*+/?@^_~]/.test(token);
        })
      ),
      ns.call("_")
    ])
  );

/*
punct   <- [#$(),.:;=\[\\\]] _
*/
  ns.define("punct",
    pf.seq([
      pf.if(function cond(token) {
        return /[#$(),.:;=\[\\\]]/.test(token);
      }),
      ns.call("_")
    ])
  );

/*
_       <- &punct                           # token boundary
         / (space / comment)*
*/
  ns.define("_",
    pf.alt([
      pf.follow(
        ns.call("punct")
      ),
      pf.star(
        pf.alt([
          ns.call("space"),
          ns.call("comment")
        ])
      )
    ])
  );

/*
comment <- '#' space (!EOL .)*
*/
  ns.define("comment",
    pf.seq([
      pf.term("#"),
      ns.call("space"),
      pf.star(
        pf.seq([
          pf.not(
            ns.call("EOL")
          ),
          pf.any
        ])
      )
    ])
  );

/*
space   <- [ \t-\r]
*/
  ns.define("space",
    pf.if(function cond(token) {
      return /[ \t-\r]/.test(token);
    })
  );

/*
EOL     <- '\n'
         / '\r' '\n'?
*/
  ns.define("EOL",
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

/*
EOF     <- !.
*/
  ns.define("EOF",
    pf.not(
      pf.any
    )
  );

  return ns;  // return grammar namespace
};
