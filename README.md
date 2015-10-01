tart-PEG
========

Parsing Expression Grammar (PEG) tools 
([tart](https://github.com/organix/tartjs) module) 

## Usage

To run the below example run:

    npm run readme

```javascript
"use strict";

var tart = require('tart');
var sponsor = tart.minimal({
    fail: function (exception) {
        console.log('FAIL!', exception);
    }
});

var PEG = require('../index.js');

var ok = sponsor(function(m) {
    console.log('ok:', m);
});
var fail = sponsor(function(m) {
    console.log('FAIL!', m);
});

var anything = sponsor(PEG.anythingBeh);
var endOfInput = sponsor(PEG.notPtrn(anything));
var parser = sponsor(PEG.sequencePtrn([
    sponsor(PEG.terminalPtrn('.')),
    endOfInput
]));

parser({
    in: {
        source: '.',
        offset: 0
    },
    ok: ok,
    fail: fail
});

```

## Tests

    npm test

## Documentation

The following are actor _behavior_ factories.
Use `sponsor(behavior)` to create a pattern-matching actor.

  * [PEG.fail](#PEGfail)
  * [PEG.empty](#PEGempty)
  * [PEG.anything](#PEGanything)
  * [PEG.terminal(token)](#PEGterminaltoken)
  * [PEG.predicate(condition)](#PEGpredicatecondition)
  * [PEG.not(pattern)](#PEGnotpattern)
  * [PEG.follow(pattern)](#PEGfollowpattern)
  * [PEG.memoize(pattern, \[name, \[log\]\])](#PEGmemoizepatternnamelog)

PEG parsing actors expect a message with the following attributes:

  * `in`: _Object_ Input position to start matching:
    * `source`: _String/Array_ Sequence of Characters/Tokens to match.
    * `offset`: _Number_ Current offset (zero-based) into `source`.
  * `ok`: _Actor_ Send result message to this actor on success.
  * `fail`: _Actor_ Send result message to this actor on failure.
  * `value`: _Any_ Accumulated value, if any.

On success/failure the `ok`/`fail` actors expect a result message with the following attributes:

  * `in`: _Object_ Input position to continue matching:
    * `source`: _String/Array_ Sequence of Characters/Tokens to match.
    * `offset`: _Number_ Next offset (zero-based) into `source`.
  * `value`: _Any_ Result value, if any.

### PEG.fail

Always fail to match, consuming no input.

### PEG.empty

Always successfully match, consuming no input.

### PEG.anything

Match and consume the current input Character/Token.
Fail if there is no further input available.

### PEG.terminal(token)

  * `token`: _Any_ The token to expect.

Match and consume the current input Character/Token, if `== token`.
Otherwise fail, consuming no input.

### PEG.predicate(condition)

  * `condition`: _Function_ `function (token) {}`
    Evaluates `true` if the `token` meets the matching condition.

Match and consume the current input Character/Token, if it meets the `condition`.
Otherwise fail, consuming no input.

### PEG.not(pattern)

  * `pattern`: _Actor_ The pattern to check for look-ahead.

Match, but do *not* consume any input, if `pattern` fails at the current position.

### PEG.follow(pattern)

  * `pattern`: _Actor_ The pattern to check for look-ahead.

Match, but do *not* consume any input, if `pattern` matches at the current position.

### PEG.memoize(pattern, [name, [log]])

  * `pattern`: _Actor_ The pattern for which successful results will be remembered.
  * `name`: _String_ _(Default: `''`)_ The name used to label this pattern, if any.
  * `log`: _Function_ _(Default: `console.log`)_ Used to log informative messages.

Match and remember result if `pattern` matches.
Subsequent attempts to match at the same position will immediately return the remembered result.

## Contributors

[@dalnefre](https://github.com/dalnefre), [@tristanls](https://github.com/tristanls)
