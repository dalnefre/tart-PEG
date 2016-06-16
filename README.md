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
    fail: function (e) {
        console.log('ERROR!', e);
    }
});

var PEG = require('../PEG.js');
var input = require('../input.js');

//var log = console.log;
var log = function () {};

var pf = PEG.factory(sponsor);
var ns = pf.namespace(log);

/*
Assign <- Name "=" Assign
        / Expr
*/
ns.define('Assign',
    pf.choice([
        pf.sequence([
            ns.call('Name'),
            pf.terminal('='),
            ns.call('Assign')
        ]),
        ns.call('Expr')
    ])
);

/*
Name   <- [a-zA-Z]
*/
ns.define('Name',
    pf.predicate(function (token) {
        return /[a-zA-Z]/.test(token);
    })
);

/*
Expr   <- Term ([-+] Term)*
*/
ns.define('Expr',
    pf.sequence([
        ns.call('Term'),
        pf.zeroOrMore(
            pf.sequence([
                pf.predicate(function (token) {
                    return /[-+]/.test(token);
                }),
                ns.call('Term')
            ])
        )
    ])
);

/*
Term   <- Factor ([/*] Factor)*
*/
ns.define('Term',
    pf.sequence([
        ns.call('Factor'),
        pf.zeroOrMore(
            pf.sequence([
                pf.predicate(function (token) {
                    return /[/*]/.test(token);
                }),
                ns.call('Factor')
            ])
        )
    ])
);

/*
Factor <- "(" Assign ")"
        / Name
        / [0-9]+
*/
ns.define('Factor',
    pf.choice([
        pf.sequence([
            pf.terminal('('),
            ns.call('Assign'),
            pf.terminal(')')
        ]),
        ns.call('Name'),
        pf.oneOrMore(
            pf.predicate(function (token) {
                return /[0-9]/.test(token);
            })
        )
    ])
);

var ok = sponsor(function okBeh(m) {
    console.log('OK:', JSON.stringify(m, null, '  '));
});
var fail = sponsor(function failBeh(m) {
    console.log('FAIL:', JSON.stringify(m, null, '  '));
});

var start = ns.call('Assign');
var matcher = pf.matcher(start, ok, fail);
var next = input.fromString(sponsor, 'x=y=10-2/3+4*5/(6-7)');
next(matcher);

```


## Tests

    npm test


## Message Protocol

A location within a stream is represented with an object like this:

  * `value`: _Object_ Token at current position, if any.
  * `pos`: _Number_ Position in the stream (zero-based).
  * `next`: _Actor_ Actor used to access the next stream position.

Line-oriented character stream have these additional attributes:

  * `row`: _Number_ Line offset (zero-based).
  * `col`: _Number_ Position within the line (zero-based).

PEG parsing actors expect a message with the following attributes:

  * `input`: _Object_ Input stream location (described above).
  * `ok`: _Actor_ Send result message to this actor on success.
  * `fail`: _Actor_ Send result message to this actor on failure.

On success/failure the `ok`/`fail` actors expect a _result_ message 
with the following attributes:

  * `start`: _Object_ Stream location where matching began.
  * `end`: _Object_ Stream location where matching should continue.
  * `value`: _Any_ Result value, if any.


## Actor Behaviors

PEG parsing actors are created to check for a match at a given input position.
Their _behavior_ is configured by one of the following factory methods.
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
  * [PEG.object(object)](#pegobjectobject)
  * [PEG.memoize(pattern, \[name, \[log\]\])](#pegmemoizepattern-name-log)

### PEG.fail

Always fail to match, consuming no input.
The result `value` is `undefined`.

### PEG.empty

Always successfully match, consuming no input.
The result `value` is `[]`.

### PEG.anything
#### PEG.dot

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
#### PEG.star(pattern)

  * `pattern`: _Actor_ The pattern to check for possible repetition.

The `pattern` is matched as many times as possible (maybe 0 times), consuming all the corresponding input.
When the `pattern` fails, the _repetition_ matches up to the failed input position.
The result `value` is an _Array_ (possibly empty) of the matched values.

### PEG.oneOrMore(pattern)
#### PEG.plus(pattern)

  * `pattern`: _Actor_ The pattern to check for repetition.

The `pattern` is matched as many times as possible (at least 1 time), consuming all the corresponding input.
If the first occurance fails, the _repetition_ fails, consuming no input.
After the first occurance, when the `pattern` fails, the _repetition_ matches up to the failed input position.
On success, the result `value` is an _Array_ of the matched values.

### PEG.zeroOrOne(pattern)
#### PEG.question(pattern)
#### PEG.optional(pattern)

  * `pattern`: _Actor_ The pattern to check for optional occurance.

Match regardless if `pattern` matches or fails at the current position.
If `pattern` matches, the corresponding input is consumed.
Otherwise, no input is consumed.
The result `value` is an _Array_ (possibly empty) of the matched values.

### PEG.object(object)

  * `object`: _Object_ An object containing expected property values.

Match and consume the current input Token, if it matches `object`.
Otherwise fail, consuming no input.
On success, the result `value` is the consumed input Token.

### PEG.memoize(pattern, [name, [log]])
#### PEG.packrat(pattern, [name, [log]])

  * `pattern`: _Actor_ The pattern for which successful results will be remembered.
  * `name`: _String_ _(Default: `''`)_ The name used to label this pattern, if any.
  * `log`: _Function_ _(Default: `console.log`)_ Used to log informative messages.

Match and remember result if `pattern` matches.
Subsequent attempts to match at the same position will immediately return the remembered result.


## Utilities

These utilities ease construction and use of PEG parsing actors.

  * [PEG.namespace(\[log\])](#pegnamespacelog)
  * [PEG.start(pattern, ok, fail)](#pegstartpattern-ok-fail)
  * [PEG.factory(sponsor)](#pegfactorysponsor)

### PEG.namespace([log])

  * `log`: _Function_ _(Default: `console.log`)_ Used to log informative messages.

Establish a collection of related pattern actors which form a cohesive grammar.
Pattern actors within the namespace my refer to each other by name.
This allows for mutually recursive references within the grammar.
A _namespace_ object is returned with the following attributes:

  * `define`: _Function_ `function (name, pattern) {}`
    Establishes a _name_ for this _pattern_ in the grammar namespace.
  * `lookup`: _Function_ `function (name) {}`
    Returns a behavior that matches the pattern with this _name_ in the grammar namespace.
  * `transform`: _Function_ `function (name, transform) {}`
    Establishes a result _transform_ function for the pattern with this _name_ in the grammar namespace.

A result _transform_ function has the form `function (name, value, result) {}`
and returns an new _result_ object with the following attributes:

  * `name`: _String_ The name established for this _pattern_ in the grammar namespace.
  * `value`: _Any_ Result value, if any.
  * `start`: _Object_ _(Default: `result.start`)_ Stream location where matching began.
  * `end`: _Object_ _(Default: `result.end`)_ Stream location where matching should continue.

The default transform function simply injects the pattern name into the result.

A _namespace_ object is configurable using the following additional attributes:

  * `wrapper`: _Function_ `function (rule) {}`
    Returns a behavior ...
  * `transformWrapper`: _Function_ `function (rule) {}`
    Returns a behavior ...
  * `stackingWrapper`: _Function_ `function (pattern, rule) {}`
    Returns a behavior ...

Each of these has appropriate defaults which are designed to work together.
Be careful if you choose override them.

### PEG.start(pattern, ok, fail)

  * `pattern`: _Actor_ The initial pattern for matching this grammar.
  * `ok`: _Actor_ Send result message to this actor on success.
  * `fail`: _Actor_ Send result message to this actor on failure.

Returns a parser bootstrap behavior. 
Use an _Actor_ with this behavior as the customer 
for reading from an actor-based _input_ stream. 
This will start the `pattern` matching process. 

### PEG.factory(sponsor)

  * `sponsor`: _Function_ The sponsor used to create actors.

Returns a factory for creating pattern-matching actors with a common `sponsor`.
The factory has helpers (and aliases) for nearly all of the [PEG methods](#actor-behaviors), including:

  * `fail`: _Actor_ with [PEG.fail](#pegfail) behavior.
  * `empty`: _Actor_ with [PEG.empty](#pegempty) behavior.
  * `anything`|`any`|`dot`: _Actor_ with [PEG.anything](#peganything) behavior.
  * `terminal`|`term`: _Function_ `function (token) {}` 
    uses [PEG.terminal(token)](#pegterminaltoken) behavior.
  * `predicate`|`cond`|`if`: _Function_ `function (condition) {}` 
    uses [PEG.predicate(condition)](#pegpredicatecondition) behavior.
  * `not`: _Function_ `function (pattern) {}` 
    uses [PEG.not(pattern)](#pegnotpattern) behavior.
  * `follow`: _Function_ `function (pattern) {}` 
    uses [PEG.follow(pattern)](#pegfollowpattern) behavior.
  * `sequence`|`seq`: _Function_ `function (list) {}` 
    uses [PEG.sequence(list)](#pegsequencelist) behavior.
  * `choice`|`alt`: _Function_ `function (list) {}` 
    uses [PEG.choice(list)](#pegchoicelist) behavior.
  * `zeroOrMore`|`star`: _Function_ `function (pattern) {}` 
    uses [PEG.zeroOrMore(pattern)](#pegzeroormorepattern) behavior.
  * `oneOrMore`|`plus`: _Function_ `function (pattern) {}` 
    uses [PEG.oneOrMore(pattern)](#pegoneormorepattern) behavior.
  * `zeroOrOne`|`question`|`optional`|`opt`: _Function_ `function (pattern) {}` 
    uses [PEG.zeroOrOne(pattern)](#pegzerooronepattern) behavior.
  * `object`|`like`: _Function_ `function (object) {}` 
    uses [PEG.object(object)](#pegobjectobject) behavior.
  * `packrat`|`memoize`|`memo`: _Function_ `function (pattern, [name, [log]]) {}` 
    uses [PEG.memoize(pattern,...)](#pegmemoizepattern-name-log) behavior.
  * `namespace`|`scope`: _Function_ `function ([log]) {}` 
    augments [PEG.namespace(\[log\])](#pegnamespacelog) with:
    * `call`: _Function_ `function (name) {}`
      Returns an _Actor_ that matches the pattern with this (late bound) _name_.
  * `start`|`match`|`matcher`: _Function_ `function (pattern, ok, fail)` 
    uses [PEG.start(pattern, ok, fail)](#pegstartpattern-ok-fail) behavior.


## Contributors

[@dalnefre](https://github.com/dalnefre), [@tristanls](https://github.com/tristanls)
