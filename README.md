# handshake

[![Made by unshift][made-by]](http://unshift.io)[![Version npm][version]](http://browsenpm.org/package/handshake)[![Build Status][build]](https://travis-ci.org/unshiftio/handshake)[![Dependencies][david]](https://david-dm.org/unshiftio/handshake)[![Coverage Status][cover]](https://coveralls.io/r/unshiftio/handshake?branch=master)[![IRC channel][irc]](http://webchat.freenode.net/?channels=unshift)

[made-by]: https://img.shields.io/badge/made%20by-unshift-00ffcc.svg?style=flat-square
[version]: https://img.shields.io/npm/v/handshake.svg?style=flat-square
[build]: https://img.shields.io/travis/unshiftio/handshake/master.svg?style=flat-square
[david]: https://img.shields.io/david/unshiftio/handshake.svg?style=flat-square
[cover]: https://img.shields.io/coveralls/unshiftio/handshake/master.svg?style=flat-square
[irc]: https://img.shields.io/badge/IRC-irc.freenode.net%23unshift-00a8ff.svg?style=flat-square

## Installation

The module is released in the public npm registry and can be installed using:

```
npm install --save handshake
```

## Usage

In all the examples we assume that you've already required and setup the
Handshake instance using:

```js
'use strict';

var Handshake = require('handshake');
```

To construct a new `Handshake` instance we need two things:

1. A context/scope/this value for all the callbacks that we execute. Which is
   required but can be set to null, undefined or whatever.
2. Options for further configuring the handshake.

So for the optional options, you can supply the following properties:

- **`handshake timeout`** Maximum time a user is allowed to spend to modifying
  the handshake data. As the last thing we want to do is introduce extra
  latency. Defaults to `5 seconds`.

## License

MIT
