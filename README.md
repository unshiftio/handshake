# handshake

[![Made by unshift][made-by]](http://unshift.io)[![Version npm][version]](http://browsenpm.org/package/handshake)[![Build Status][build]](https://travis-ci.org/unshiftio/handshake)[![Dependencies][david]](https://david-dm.org/unshiftio/handshake)[![Coverage Status][cover]](https://coveralls.io/r/unshiftio/handshake?branch=master)[![IRC channel][irc]](http://webchat.freenode.net/?channels=unshift)

[made-by]: https://img.shields.io/badge/made%20by-unshift-00ffcc.svg?style=flat-square
[version]: https://img.shields.io/npm/v/handshake.svg?style=flat-square
[build]: https://img.shields.io/travis/unshiftio/handshake/master.svg?style=flat-square
[david]: https://img.shields.io/david/unshiftio/handshake.svg?style=flat-square
[cover]: https://img.shields.io/coveralls/unshiftio/handshake/master.svg?style=flat-square
[irc]: https://img.shields.io/badge/IRC-irc.freenode.net%23unshift-00a8ff.svg?style=flat-square

Handshake is a small library which helps you create, validate handshakes between
client and server. To make this module as flexible and extendible as possible we
don't make any assumptions about properties the data that should be returned in
the handshake the only requirements we set are:

- It should be an object with keys so we can transform the key and value's to a
  query string.

So you might wonder why we went with a query string. There a couple of good
reasons about this. When we are handshaking we do not know which protocols the
server and clients support so we cannot encode and decode the data yet. So we
need to have an encoding format which is super easy to parse for both the server
and clients. In addition to that it's easy to debug as it's a human readable
format. 

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

For our examples we just assume it has been setup as following:

```js
var handshake = new Handshake();
```

### set

### update

Configure/compile the default values of the handshake payload. This way we don't
have to re-compile the data every single time a handshake is requested. You
should call the `update` method once you are done with setting all your
properties using the `.set` method.

```js
handshake
.set('version', require('./package.json').version)
.set('another', 'value');

handshake.update();
```

## License

MIT
