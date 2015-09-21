tart-PEG
========

Parsing Expression Grammar (PEG) tools (tart module)

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

var empty = sponsor(PEG.emptyBeh);

empty({
    in: {
        source: '',
        offset: 0
    },
    ok: ok,
    fail: fail
});

```

## Tests

    npm test
