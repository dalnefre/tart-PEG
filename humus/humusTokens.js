/* Generated PEG grammar */
"use strict";
var grammar = module.exports;

var PEG = require("../PEG.js");

grammar.build = function build(sponsor, log) {
  var pf = PEG.factory(sponsor);
  var ns = pf.namespace(log);

/*
tokens  <- token* _ EOF
*/
  ns.define("tokens",
    pf.seq([
      pf.star(
        ns.call("token")
      ),
      ns.call("_"),
      ns.call("EOF")
    ])
  );

/*
token   <- _ (symbol / number / char / string / ident / punct)
*/
  ns.define("token",
    pf.seq([
      ns.call("_"),
      pf.alt([
        ns.call("symbol"),
        ns.call("number"),
        ns.call("char"),
        ns.call("string"),
        ns.call("ident"),
        ns.call("punct")
      ])
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
number  <- '-'? [0-9]+ ('#' [0-9a-zA-Z]+)?
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
      )
    ])
  );

/*
char    <- "'" (!"'" qchar) "'"
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
      pf.term("'")
    ])
  );

/*
string  <- '"' (!'"' qchar)+ '"'
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
      pf.term("\"")
    ])
  );

/*
qchar   <- '\\' [nrt'"\[\]\\]
         / '\\' 'u' [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F]
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
        pf.term("\\"),
        pf.term("u"),
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
name    <- [-0-9a-zA-Z!%&'*+/?@^_~]+
*/
  ns.define("name",
    pf.plus(
      pf.if(function cond(token) {
        return /[-0-9a-zA-Z!%&'*+/?@^_~]/.test(token);
      })
    )
  );

/*
punct   <- [#$(),.:;=\[\\\]]
*/
  ns.define("punct",
    pf.if(function cond(token) {
      return /[#$(),.:;=\[\\\]]/.test(token);
    })
  );

/*
_       <- (comment / space)*               # optional whitespace
*/
  ns.define("_",
    pf.star(
      pf.alt([
        ns.call("comment"),
        ns.call("space")
      ])
    )
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
