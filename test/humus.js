/*

test.js - test script

The MIT License (MIT)

Copyright (c) 2015 Dale Schumacher

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";

var test = module.exports = {};

//var log = console.log;
var log = function () {};

var tart = require('tart-tracing');
var PEG = require('../PEG.js');
var input = require('../input.js');

test['empty source returns empty array'] = function (test) {
    test.expect(4);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var humusTokens = require('../examples/humusTokens.js').build(sponsor);
    var source = input.fromString(sponsor, 
        ''
    );

    var start = sponsor(PEG.start(
        humusTokens.call('tokens'),
        sponsor(function okBeh(m) {
            log('Tokens OK:', JSON.stringify(m, null, '  '));
            var v = m.value;
            test.strictEqual('tokens', v.name);
            v = v.value;
            test.strictEqual(2, v.length);
            var tokens = v[0];
            test.strictEqual(0, tokens.length);
        }),
        sponsor(function failBeh(m) {
            log('Tokens FAIL:', JSON.stringify(m, null, '  '));
            test.ok(false);
        })
    ));
    source(start);

    require('../fixture.js').testEventLoop(test, 3, tracing.eventLoop, log);
};

test['blank source returns empty array'] = function (test) {
    test.expect(4);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var humusTokens = require('../examples/humusTokens.js').build(sponsor/*, log*/);
//    require('../examples/reduceTokens.js').transform(humusTokens);  // add reduction transforms
    var source = input.fromString(sponsor, 
        '\r'
    );

    var start = sponsor(PEG.start(
        humusTokens.call('tokens'),
        sponsor(function okBeh(m) {
            log('Tokens OK:', JSON.stringify(m, null, '  '));
            var v = m.value;
            test.strictEqual('tokens', v.name);
            v = v.value;
            test.strictEqual(2, v.length);
            var tokens = v[0];
            test.strictEqual(0, tokens.length);
        }),
        sponsor(function failBeh(m) {
            log('Tokens FAIL:', JSON.stringify(m, null, '  '));
            test.ok(false);
        })
    ));
    source(start);

    require('../fixture.js').testEventLoop(test, 3, tracing.eventLoop, log);
};

test['transformed simple source returns token array'] = function (test) {
    test.expect(2);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var humusTokens = require('../examples/humusTokens.js').build(sponsor/*, log*/);
    require('../examples/reduceTokens.js').transform(humusTokens);  // add reduction transforms
    var source = input.fromString(sponsor,
        'SEND (#Hello, "World", \'\\n\', ##, -16#2a) TO println\n'
    );

    var start = sponsor(PEG.start(
        humusTokens.call('tokens'),
        sponsor(function okBeh(m) {
            log('Tokens OK:', JSON.stringify(m, null, '  '));
            var tokens = m.value;
            test.strictEqual(14, tokens.length);
        }),
        sponsor(function failBeh(m) {
            log('Tokens FAIL:', JSON.stringify(m, null, '  '));
            test.ok(false);
        })
    ));
    source(start);

    require('../fixture.js').asyncRepeat(3,
        function action() {
            return tracing.eventLoop({
//                count: 100,
//                log: function (effect) { console.log('DEBUG', effect); },
              fail: function (error) { console.log('FAIL!', error); }
            });
        },
        function callback(error, result) {
            log('asyncRepeat callback:', error, result);
            test.ok(!error && result);
            test.done();
        }
    );
};

/*
Tokens OK: {
  "start": {
    "pos": 0,
    "value": "S",
    "row": 0,
    "col": 0
  },
  "end": {},
  "value": [
    "SEND",
    "(",
    {
      "type": "symbol",
      "value": "Hello"
    },
    ",",
    {
      "type": "string",
      "value": "World"
    },
    ",",
    {
      "type": "char",
      "value": "\n"
    },
    ",",
    {
      "type": "symbol",
      "value": "#"
    },
    ",",
    {
      "type": "number",
      "sign": "-",
      "radix": 16,
      "digits": "2a",
      "value": -42
    },
    ")",
    "TO",
    {
      "type": "ident",
      "value": "println"
    }
  ]
}
*/

/*
<TOKENS>
"SEND"
"("
{"type":"symbol","value":"Hello"}
","
{"type":"string","value":"World"}
","
{"type":"char","value":"\n"}
","
{"type":"symbol","value":"#"}
","
{"type":"number","sign":"-","radix":16,"digits":"2a","value":-42}
")"
"TO"
{"type":"ident","value":"println"}
</TOKENS>
*/

var humusFixture = function humusFixture(test, sponsor, log) {
    log = log || function () {};
    var fixture = {
        humusTokens: require('../examples/humusTokens.js').build(sponsor, log),
        humusSyntax: require('../examples/humusSyntax.js').build(sponsor, log),
        test: test,
        sponsor: sponsor,
        log: log
    };
    require('../examples/reduceTokens.js').transform(fixture.humusTokens);
    require('../examples/reduceSyntax.js').transform(fixture.humusSyntax);
    var ok = fixture.ok = function ok(validate) {
        return sponsor(function okBeh(m) {
            log('Tokens OK:', JSON.stringify(m, null, '  '));
            validate(m);
        });
    };
    var fail = fixture.fail = sponsor(function failBeh(m) {
        log('Tokens FAIL:', JSON.stringify(m, null, '  '));
        test.ok(false);
    });
    log('humusFixture:', fixture);
    return fixture;
};

test['TRUE is a simple constant expression'] = function (test) {
    test.expect(3);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var hf = humusFixture(test, sponsor/*, log*/);

    var source = input.fromString(sponsor,
        'TRUE'
    );

    var start = sponsor(PEG.start(
        hf.humusSyntax.call('expr'),
        hf.ok(function validate(m) {
            var v = m.value;
            test.strictEqual('const_expr', v.beh);
            test.strictEqual(true, v.value);
        }),
        hf.fail
    ));
    source(start);

    require('../fixture.js').testEventLoop(test, 3, tracing.eventLoop, log);
};

test['SEND a variety of data types'] = function (test) {
    test.expect(4);
    var tracing = tart.tracing();
    var sponsor = tracing.sponsor;
    var hf = humusFixture(test, sponsor/*, log*/);

    var source = input.fromString(sponsor,
        'SEND (#Hello, "World", \'\\n\', ##, -16#2a) TO println\n'
    );

    var start = sponsor(PEG.start(
        hf.humusSyntax.call('stmt'),
        hf.ok(function validate(m) {
            var v = m.value;
            test.strictEqual('send_stmt', v.beh);
            test.strictEqual('object', typeof v.msg);
            test.strictEqual('object', typeof v.to);
        }),
        hf.fail
    ));
    source(start);

    require('../fixture.js').testEventLoop(test, 3, tracing.eventLoop, log);
};

/*
Syntax OK: {
  "start": {
    "token": "SEND",
    "value": "SEND",
    "pos": 0
  },
  "end": {
    "pos": 14
  },
  "value": {
    "name": "humus",
    "start": {
      "token": "SEND",
      "value": "SEND",
      "pos": 0
    },
    "end": {
      "pos": 14
    },
    "value": [
      {
        "name": "stmt",
        "start": {
          "token": "SEND",
          "value": "SEND",
          "pos": 0
        },
        "end": {
          "pos": 14
        },
        "value": [
          [],
          "SEND",
          {
            "name": "expr",
            "start": {
              "token": "(",
              "value": "(",
              "pos": 1
            },
            "end": {
              "token": "TO",
              "value": "TO",
              "pos": 12
            },
            "value": {
              "name": "term",
              "start": {
                "token": "(",
                "value": "(",
                "pos": 1
              },
              "end": {
                "token": "TO",
                "value": "TO",
                "pos": 12
              },
              "value": [
                "(",
                [
                  {
                    "name": "expr",
                    "start": {
                      "token": {
                        "type": "symbol",
                        "value": "Hello"
                      },
                      "value": {
                        "type": "symbol",
                        "value": "Hello"
                      },
                      "pos": 2
                    },
                    "end": {
                      "token": ")",
                      "value": ")",
                      "pos": 11
                    },
                    "value": [
                      {
                        "name": "term",
                        "start": {
                          "token": {
                            "type": "symbol",
                            "value": "Hello"
                          },
                          "value": {
                            "type": "symbol",
                            "value": "Hello"
                          },
                          "pos": 2
                        },
                        "end": {
                          "token": ",",
                          "value": ",",
                          "pos": 3
                        },
                        "value": {
                          "name": "const",
                          "start": {
                            "token": {
                              "type": "symbol",
                              "value": "Hello"
                            },
                            "value": {
                              "type": "symbol",
                              "value": "Hello"
                            },
                            "pos": 2
                          },
                          "end": {
                            "token": ",",
                            "value": ",",
                            "pos": 3
                          },
                          "value": {
                            "name": "symbol",
                            "start": {
                              "token": {
                                "type": "symbol",
                                "value": "Hello"
                              },
                              "value": {
                                "type": "symbol",
                                "value": "Hello"
                              },
                              "pos": 2
                            },
                            "end": {
                              "token": ",",
                              "value": ",",
                              "pos": 3
                            },
                            "value": {
                              "type": "symbol",
                              "value": "Hello"
                            }
                          }
                        }
                      },
                      ",",
                      {
                        "name": "expr",
                        "start": {
                          "token": {
                            "type": "string",
                            "value": "World"
                          },
                          "value": {
                            "type": "string",
                            "value": "World"
                          },
                          "pos": 4
                        },
                        "end": {
                          "token": ")",
                          "value": ")",
                          "pos": 11
                        },
                        "value": [
                          {
                            "name": "term",
                            "start": {
                              "token": {
                                "type": "string",
                                "value": "World"
                              },
                              "value": {
                                "type": "string",
                                "value": "World"
                              },
                              "pos": 4
                            },
                            "end": {
                              "token": ",",
                              "value": ",",
                              "pos": 5
                            },
                            "value": {
                              "name": "const",
                              "start": {
                                "token": {
                                  "type": "string",
                                  "value": "World"
                                },
                                "value": {
                                  "type": "string",
                                  "value": "World"
                                },
                                "pos": 4
                              },
                              "end": {
                                "token": ",",
                                "value": ",",
                                "pos": 5
                              },
                              "value": {
                                "name": "string",
                                "start": {
                                  "token": {
                                    "type": "string",
                                    "value": "World"
                                  },
                                  "value": {
                                    "type": "string",
                                    "value": "World"
                                  },
                                  "pos": 4
                                },
                                "end": {
                                  "token": ",",
                                  "value": ",",
                                  "pos": 5
                                },
                                "value": {
                                  "type": "string",
                                  "value": "World"
                                }
                              }
                            }
                          },
                          ",",
                          {
                            "name": "expr",
                            "start": {
                              "token": {
                                "type": "char",
                                "value": "\n"
                              },
                              "value": {
                                "type": "char",
                                "value": "\n"
                              },
                              "pos": 6
                            },
                            "end": {
                              "token": ")",
                              "value": ")",
                              "pos": 11
                            },
                            "value": [
                              {
                                "name": "term",
                                "start": {
                                  "token": {
                                    "type": "char",
                                    "value": "\n"
                                  },
                                  "value": {
                                    "type": "char",
                                    "value": "\n"
                                  },
                                  "pos": 6
                                },
                                "end": {
                                  "token": ",",
                                  "value": ",",
                                  "pos": 7
                                },
                                "value": {
                                  "name": "const",
                                  "start": {
                                    "token": {
                                      "type": "char",
                                      "value": "\n"
                                    },
                                    "value": {
                                      "type": "char",
                                      "value": "\n"
                                    },
                                    "pos": 6
                                  },
                                  "end": {
                                    "token": ",",
                                    "value": ",",
                                    "pos": 7
                                  },
                                  "value": {
                                    "name": "char",
                                    "start": {
                                      "token": {
                                        "type": "char",
                                        "value": "\n"
                                      },
                                      "value": {
                                        "type": "char",
                                        "value": "\n"
                                      },
                                      "pos": 6
                                    },
                                    "end": {
                                      "token": ",",
                                      "value": ",",
                                      "pos": 7
                                    },
                                    "value": {
                                      "type": "char",
                                      "value": "\n"
                                    }
                                  }
                                }
                              },
                              ",",
                              {
                                "name": "expr",
                                "start": {
                                  "token": {
                                    "type": "symbol",
                                    "value": "#"
                                  },
                                  "value": {
                                    "type": "symbol",
                                    "value": "#"
                                  },
                                  "pos": 8
                                },
                                "end": {
                                  "token": ")",
                                  "value": ")",
                                  "pos": 11
                                },
                                "value": [
                                  {
                                    "name": "term",
                                    "start": {
                                      "token": {
                                        "type": "symbol",
                                        "value": "#"
                                      },
                                      "value": {
                                        "type": "symbol",
                                        "value": "#"
                                      },
                                      "pos": 8
                                    },
                                    "end": {
                                      "token": ",",
                                      "value": ",",
                                      "pos": 9
                                    },
                                    "value": {
                                      "name": "const",
                                      "start": {
                                        "token": {
                                          "type": "symbol",
                                          "value": "#"
                                        },
                                        "value": {
                                          "type": "symbol",
                                          "value": "#"
                                        },
                                        "pos": 8
                                      },
                                      "end": {
                                        "token": ",",
                                        "value": ",",
                                        "pos": 9
                                      },
                                      "value": {
                                        "name": "symbol",
                                        "start": {
                                          "token": {
                                            "type": "symbol",
                                            "value": "#"
                                          },
                                          "value": {
                                            "type": "symbol",
                                            "value": "#"
                                          },
                                          "pos": 8
                                        },
                                        "end": {
                                          "token": ",",
                                          "value": ",",
                                          "pos": 9
                                        },
                                        "value": {
                                          "type": "symbol",
                                          "value": "#"
                                        }
                                      }
                                    }
                                  },
                                  ",",
                                  {
                                    "name": "expr",
                                    "start": {
                                      "token": {
                                        "type": "number",
                                        "sign": "-",
                                        "radix": 16,
                                        "digits": "2a",
                                        "value": -42
                                      },
                                      "value": {
                                        "type": "number",
                                        "sign": "-",
                                        "radix": 16,
                                        "digits": "2a",
                                        "value": -42
                                      },
                                      "pos": 10
                                    },
                                    "end": {
                                      "token": ")",
                                      "value": ")",
                                      "pos": 11
                                    },
                                    "value": {
                                      "name": "term",
                                      "start": {
                                        "token": {
                                          "type": "number",
                                          "sign": "-",
                                          "radix": 16,
                                          "digits": "2a",
                                          "value": -42
                                        },
                                        "value": {
                                          "type": "number",
                                          "sign": "-",
                                          "radix": 16,
                                          "digits": "2a",
                                          "value": -42
                                        },
                                        "pos": 10
                                      },
                                      "end": {
                                        "token": ")",
                                        "value": ")",
                                        "pos": 11
                                      },
                                      "value": {
                                        "name": "const",
                                        "start": {
                                          "token": {
                                            "type": "number",
                                            "sign": "-",
                                            "radix": 16,
                                            "digits": "2a",
                                            "value": -42
                                          },
                                          "value": {
                                            "type": "number",
                                            "sign": "-",
                                            "radix": 16,
                                            "digits": "2a",
                                            "value": -42
                                          },
                                          "pos": 10
                                        },
                                        "end": {
                                          "token": ")",
                                          "value": ")",
                                          "pos": 11
                                        },
                                        "value": {
                                          "name": "number",
                                          "start": {
                                            "token": {
                                              "type": "number",
                                              "sign": "-",
                                              "radix": 16,
                                              "digits": "2a",
                                              "value": -42
                                            },
                                            "value": {
                                              "type": "number",
                                              "sign": "-",
                                              "radix": 16,
                                              "digits": "2a",
                                              "value": -42
                                            },
                                            "pos": 10
                                          },
                                          "end": {
                                            "token": ")",
                                            "value": ")",
                                            "pos": 11
                                          },
                                          "value": {
                                            "type": "number",
                                            "sign": "-",
                                            "radix": 16,
                                            "digits": "2a",
                                            "value": -42
                                          }
                                        }
                                      }
                                    }
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ],
                ")"
              ]
            }
          },
          "TO",
          {
            "name": "expr",
            "start": {
              "token": {
                "type": "ident",
                "value": "println"
              },
              "value": {
                "type": "ident",
                "value": "println"
              },
              "pos": 13
            },
            "end": {
              "pos": 14
            },
            "value": {
              "name": "term",
              "start": {
                "token": {
                  "type": "ident",
                  "value": "println"
                },
                "value": {
                  "type": "ident",
                  "value": "println"
                },
                "pos": 13
              },
              "end": {
                "pos": 14
              },
              "value": {
                "name": "ident",
                "start": {
                  "token": {
                    "type": "ident",
                    "value": "println"
                  },
                  "value": {
                    "type": "ident",
                    "value": "println"
                  },
                  "pos": 13
                },
                "end": {
                  "pos": 14
                },
                "value": {
                  "type": "ident",
                  "value": "println"
                }
              }
            }
          }
        ]
      }
    ]
  }
}
*/
