/* Generated PEG grammar */
"use strict";
var grammar = module.exports;

var PEG = require("./PEG.js");

grammar.build = function build(sponsor, log) {
  var pf = PEG.factory(sponsor);
  var ns = pf.namespace(log);

/*
Grammar     <- _ Rule+ EOF
*/
  ns.define("Grammar",
    pf.seq([
      ns.call("_"),
      pf.plus(
        ns.call("Rule")
      ),
      ns.call("EOF")
    ])
  );

/*
Rule        <- Name LEFTARROW Expression
*/
  ns.define("Rule",
    pf.seq([
      ns.call("Name"),
      ns.call("LEFTARROW"),
      ns.call("Expression")
    ])
  );

/*
Expression  <- Sequence (SLASH Sequence)*
*/
  ns.define("Expression",
    pf.seq([
      ns.call("Sequence"),
      pf.star(
        pf.seq([
          ns.call("SLASH"),
          ns.call("Sequence")
        ])
      )
    ])
  );

/*
Sequence    <- Prefix*
*/
  ns.define("Sequence",
    pf.star(
      ns.call("Prefix")
    )
  );

/*
Prefix      <- (AND / NOT)? Suffix
*/
  ns.define("Prefix",
    pf.seq([
      pf.opt(
        pf.alt([
          ns.call("AND"),
          ns.call("NOT")
        ])
      ),
      ns.call("Suffix")
    ])
  );

/*
Suffix      <- Primary (QUESTION / STAR / PLUS)?
*/
  ns.define("Suffix",
    pf.seq([
      ns.call("Primary"),
      pf.opt(
        pf.alt([
          ns.call("QUESTION"),
          ns.call("STAR"),
          ns.call("PLUS")
        ])
      )
    ])
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
    pf.alt([
      pf.seq([
        ns.call("Name"),
        pf.not(
          ns.call("LEFTARROW")
        )
      ]),
      pf.seq([
        ns.call("OPEN"),
        ns.call("Expression"),
        ns.call("CLOSE")
      ]),
      ns.call("Literal"),
      ns.call("Class"),
      ns.call("Object"),
      ns.call("DOT")
    ])
  );

/*
Name        <- [a-zA-Z_] [a-zA-Z_0-9]* _
*/
  ns.define("Name",
    pf.seq([
      pf.if(function cond(token) {
        return /[a-zA-Z_]/.test(token);
      }),
      pf.star(
        pf.if(function cond(token) {
          return /[a-zA-Z_0-9]/.test(token);
        })
      ),
      ns.call("_")
    ])
  );

/*
Literal     <- "\"" (!"\"" Character)+ "\"" _
             / "'" (!"'" Character)+ "'" _
*/
  ns.define("Literal",
    pf.alt([
      pf.seq([
        pf.term("\""),
        pf.plus(
          pf.seq([
            pf.not(
              pf.term("\"")
            ),
            ns.call("Character")
          ])
        ),
        pf.term("\""),
        ns.call("_")
      ]),
      pf.seq([
        pf.term("'"),
        pf.plus(
          pf.seq([
            pf.not(
              pf.term("'")
            ),
            ns.call("Character")
          ])
        ),
        pf.term("'"),
        ns.call("_")
      ])
    ])
  );

/*
Class       <- "[" (!"]" Range)+ "]" _
*/
  ns.define("Class",
    pf.seq([
      pf.term("["),
      pf.plus(
        pf.seq([
          pf.not(
            pf.term("]")
          ),
          ns.call("Range")
        ])
      ),
      pf.term("]"),
      ns.call("_")
    ])
  );

/*
Range       <- Character "-" Character / Character
*/
  ns.define("Range",
    pf.alt([
      pf.seq([
        ns.call("Character"),
        pf.term("-"),
        ns.call("Character")
      ]),
      ns.call("Character")
    ])
  );

/*
Character   <- "\\" [nrt'"\[\]\\]
             / "\\" "u" [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F]
             / !"\\" .
*/
  ns.define("Character",
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
Object      <- LBRACE (Property (COMMA Property)*)? RBRACE
*/
  ns.define("Object",
    pf.seq([
      ns.call("LBRACE"),
      pf.opt(
        pf.seq([
          ns.call("Property"),
          pf.star(
            pf.seq([
              ns.call("COMMA"),
              ns.call("Property")
            ])
          )
        ])
      ),
      ns.call("RBRACE")
    ])
  );

/*
Property    <- Name COLON Literal

*/
  ns.define("Property",
    pf.seq([
      ns.call("Name"),
      ns.call("COLON"),
      ns.call("Literal")
    ])
  );

/*
DOT         <- "." _

*/
  ns.define("DOT",
    pf.seq([
      pf.term("."),
      ns.call("_")
    ])
  );

/*
LEFTARROW   <- "<" "-" _
*/
  ns.define("LEFTARROW",
    pf.seq([
      pf.term("<"),
      pf.term("-"),
      ns.call("_")
    ])
  );

/*
SLASH       <- "/" _
*/
  ns.define("SLASH",
    pf.seq([
      pf.term("/"),
      ns.call("_")
    ])
  );

/*
AND         <- "&" _
*/
  ns.define("AND",
    pf.seq([
      pf.term("&"),
      ns.call("_")
    ])
  );

/*
NOT         <- "!" _
*/
  ns.define("NOT",
    pf.seq([
      pf.term("!"),
      ns.call("_")
    ])
  );

/*
QUESTION    <- "?" _
*/
  ns.define("QUESTION",
    pf.seq([
      pf.term("?"),
      ns.call("_")
    ])
  );

/*
STAR        <- "*" _
*/
  ns.define("STAR",
    pf.seq([
      pf.term("*"),
      ns.call("_")
    ])
  );

/*
PLUS        <- "+" _
*/
  ns.define("PLUS",
    pf.seq([
      pf.term("+"),
      ns.call("_")
    ])
  );

/*
OPEN        <- "(" _
*/
  ns.define("OPEN",
    pf.seq([
      pf.term("("),
      ns.call("_")
    ])
  );

/*
CLOSE       <- ")" _
*/
  ns.define("CLOSE",
    pf.seq([
      pf.term(")"),
      ns.call("_")
    ])
  );

/*
LBRACE      <- "{" _
*/
  ns.define("LBRACE",
    pf.seq([
      pf.term("{"),
      ns.call("_")
    ])
  );

/*
RBRACE      <- "}" _
*/
  ns.define("RBRACE",
    pf.seq([
      pf.term("}"),
      ns.call("_")
    ])
  );

/*
COLON       <- ":" _
*/
  ns.define("COLON",
    pf.seq([
      pf.term(":"),
      ns.call("_")
    ])
  );

/*
COMMA       <- "," _

*/
  ns.define("COMMA",
    pf.seq([
      pf.term(","),
      ns.call("_")
    ])
  );

/*
_           <- (Space / Comment)*   # optional whitespace
*/
  ns.define("_",
    pf.star(
      pf.alt([
        ns.call("Space"),
        ns.call("Comment")
      ])
    )
  );

/*
Comment     <- "#" (!EOL .)*
*/
  ns.define("Comment",
    pf.seq([
      pf.term("#"),
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
Space       <- [ \t-\r]
*/
  ns.define("Space",
    pf.if(function cond(token) {
      return /[ \t-\r]/.test(token);
    })
  );

/*
EOL         <- "\n"
             / "\r" "\n"?
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
EOF         <- !.
*/
  ns.define("EOF",
    pf.not(
      pf.any
    )
  );

  return ns;  // return grammar namespace
};
