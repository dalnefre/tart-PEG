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

var anything = sponsor(PEG.anything);
var endOfInput = sponsor(PEG.not(anything));
var parser = sponsor(PEG.sequence([
    sponsor(PEG.terminal('.')),
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

  * [PEG.fail](#pegfail)
  * [PEG.empty](#pegempty)
  * [PEG.anything](#peganything)
  * [PEG.terminal(token)](#pegterminaltoken)
  * [PEG.predicate(condition)](#pegpredicatecondition)
  * [PEG.not(pattern)](#pegnotpattern)
  * [PEG.follow(pattern)](#pegfollowpattern)
  * [PEG.sequence(list)](#pegsequencelist)
  * [PEG.choice(list)](#pegchoicelist)
  * [PEG.zeroOrMore(pattern)](#pegzeroormorepattern)
  * [PEG.oneOrMore(pattern)](#pegoneormorepattern)
  * [PEG.zeroOrOne(pattern)](#pegzerooronepattern)
  * [PEG.memoize(pattern, \[name, \[log\]\])](#pegmemoizepattern-name-log)

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
The result `value` is `undefined`.

### PEG.empty

Always successfully match, consuming no input.
The result `value` is `[]`.

### PEG.anything

Match and consume the current input Character/Token.
Fail if there is no further input available.
On success, the result `value` is the consumed input Character/Token.

### PEG.terminal(token)

  * `token`: _Any_ The token to expect.

Match and consume the current input Character/Token, if `== token`.
Otherwise fail, consuming no input.
On success, the result `value` is the consumed `token`.

### PEG.predicate(condition)

  * `condition`: _Function_ `function (token) {}`
    Evaluates `true` if the `token` meets the matching condition.

Match and consume the current input Character/Token, if it meets the `condition`.
Otherwise fail, consuming no input.
On success, the result `value` is the consumed input Character/Token.

### PEG.not(pattern)

  * `pattern`: _Actor_ The pattern to check for look-ahead.

Match, but do *not* consume any input, if `pattern` fails at the current position.
The result `value` is `undefined`.

### PEG.follow(pattern)

  * `pattern`: _Actor_ The pattern to check for look-ahead.

Match, but do *not* consume any input, if `pattern` matches at the current position.
The result `value` is `undefined`.

### PEG.sequence(list)

  * `list`: _Array_ The patterns to match in sequential order.

Iterate through the `list` consuming input as long as each _pattern_ matches sequentially.
If any _pattern_ fails, the _sequence_ fails, consuming no input (reverting to the original position).
On success, the result `value` is an _Array_ (possibly empty) of the matched values.

### PEG.choice(list)

  * `list`: _Array_ The patterns to match as an ordered (prioritized) choice.

Iterate through the `list` trying each _pattern_ in order.
The first _pattern_ to successfully match makes the _choice_ successful, consuming the corresponding input.
Remaining _patterns_ are not considered after a successful match.
Otherwise, each subsequent _pattern_ is tried starting from the original position.
If no _pattern_ matches, the _choice_ fails, consuming no input (reverting to the original position).
On success, the result `value` is the matched value.

### PEG.zeroOrMore(pattern)

  * `pattern`: _Actor_ The pattern to check for possible repetition.

The `pattern` is matched as many times as possible (maybe 0 times), consuming all the corresponding input.
When the `pattern` fails, the _repetition_ matches up to the failed input position.
The result `value` is an _Array_ (possibly empty) of the matched values.

### PEG.oneOrMore(pattern)

  * `pattern`: _Actor_ The pattern to check for repetition.

The `pattern` is matched as many times as possible (at least 1 time), consuming all the corresponding input.
If the first occurance fails, the _repetition_ fails, consuming no input.
After the first occurance, when the `pattern` fails, the _repetition_ matches up to the failed input position.
On success, the result `value` is an _Array_ of the matched values.

### PEG.zeroOrOne(pattern)

  * `pattern`: _Actor_ The pattern to check for optional occurance.

Match regardless if `pattern` matches or fails at the current position.
If `pattern` matches, the corresponding input is consumed.
Otherwise, no input is consumed.
The result `value` is an _Array_ (possibly empty) of the matched values.

### PEG.memoize(pattern, [name, [log]])

  * `pattern`: _Actor_ The pattern for which successful results will be remembered.
  * `name`: _String_ _(Default: `''`)_ The name used to label this pattern, if any.
  * `log`: _Function_ _(Default: `console.log`)_ Used to log informative messages.

Match and remember result if `pattern` matches.
Subsequent attempts to match at the same position will immediately return the remembered result.

## Contributors

[@dalnefre](https://github.com/dalnefre), [@tristanls](https://github.com/tristanls)
