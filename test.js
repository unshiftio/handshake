describe('handshake', function () {
  'use strict';

  var assume = require('assume')
    , Handshake = require('./')
    , context = { hi: 'mom' }
    , shake;

  beforeEach(function () {
    shake = new Handshake(context);
  });

  afterEach(function () {
    shake.destroy();
  });

  it('can be constructed without new', function () {
    assume(Handshake()).is.instanceOf(Handshake);
  });

  describe('#set', function () {
    it('returns it self', function () {
      assume(shake.set('foo', 'bar')).equals(shake);
    });

    it('throws an error when trying to set an undefined value', function () {
      assume(function () {
        shake.set('version', undefined);
      }).throws(/Cannot set undefined as value for: version/);
    });
  });

  describe('#update', function () {
    it('updates the payload with the set values', function () {
      assume(shake.payload.foo).equals(undefined);

      shake.set('foo', 'bar').update();

      assume(shake.payload.foo).equals('bar');
    });

    it('executes functions that were assigned using set', function () {
      assume(shake.payload.foo).equals(undefined);

      shake.set('foo', function foo() {
        return 'bla bla';
      }).update();

      assume(shake.payload.foo).equals('bla bla');
    });

    it('creates a new object', function () {
      shake.payload.boo = 'boo';
      assume(shake.payload.boo).equals('boo');

      shake.set('foo', 'bar').update();
      shake.set('mom', function foo() {
        return 'bla bla';
      }).update();

      assume(shake.payload.boo).equals(undefined);
      assume(shake.payload.mom).equals('bla bla');
      assume(shake.payload.foo).equals('bar');
    });

    it('calls the set function with the supplied context', function () {
      assume(shake.payload.foo).equals(undefined);

      shake.set('foo', function foo() {
        return this.hi;
      }).update();

      assume(shake.payload.foo).equals('mom');
    });
  });

  describe('#get', function () {
    it('calls the modify function with a clone of the payload', function (done) {
      shake.get(function (payload, next) {
        assume(JSON.stringify(payload)).equals(JSON.stringify(shake.payload));
        payload.foo = 'bar';

        assume(shake.payload.foo).equals(undefined);
        next();
      }, done);
    });

    it('allows sync modify functions', function (done) {
      shake.get(function (payload) {
        assume(payload).is.a('object');
      }, done);
    });

    it('sees returned errors as a failed operation for sync calls', function (done) {
      shake.get(function (payload) {
        return new Error('Im sorry');
      }, function (err, data) {
        assume(err.message).equals('Im sorry');
        assume(data).includes('error=Im%20sorry');
        done();
      });
    });

    it('calls the callback with the encoded result', function (done) {
      shake.set('foo', 'bar');
      shake.set('hello', 1314);
      shake.update();

      shake.get(function () {
        assume(this).equals(context);
      }, function (err, data) {
        assume(this).equals(context);

        assume(data).equals('foo=bar&hello=1314');
        done(err);
      });
    });

    it('timesout of modification takes to damn long', function (done) {
      shake.destroy();
      shake = new Handshake(context, { 'handshake timeout': '100 ms' });

      shake.get(function (payload, next) {

      }, function (err) {
        assume(err.message).includes('timely manner');
        done();
      });
    });

    it('can be configured with a custom stringify method', function (done) {
      shake.destroy();
      shake = new Handshake(context, { 'stringify': JSON.stringify });
      shake.set('hello', 1314).update();

      shake.get(function (payload, next) {
        payload.foo = 'bar';
        next();
      }, function (err, data) {
        data = JSON.parse(data);
        assume(data).is.a('object');
        assume(data.foo).equals('bar');
        assume(data.hello).equals(1314);

        done();
      });
    });

    it('returns an error when stringify fails', function (done) {
      shake.destroy();
      shake = new Handshake(context, { 'stringify': JSON.stringify });

      var foo = { bar: 'bar' };
      foo.foo = foo;

      shake.set('hello', 1314).update();

      shake.get(function (payload, next) {
        payload.foo = foo;
        next();
      }, function (err, data) {
        assume(data).is.a('string');

        data = JSON.parse(data);
        assume(data).is.a('object');
        assume(data.error).is.a('string');
        assume(data.error).equals(err.message);

        done();
      });
    });
  });

  describe('#destroy', function () {
    it('cleans the timers', function () {
      /* istanbul ignore next */
      shake.timers.setTimeout(function () {
        throw new Error('lol cakes');
      }, 1);

      shake.destroy();
    });

    it('returns true on first destruction', function () {
      assume(shake.destroy()).equals(true);
    });

    it('returns false on second destruction', function () {
      assume(shake.destroy()).equals(true);
      assume(shake.destroy()).equals(false);
      assume(shake.destroy()).equals(false);
      assume(shake.destroy()).equals(false);
      assume(shake.destroy()).equals(false);
    });
  });
});
