'use strict';

var qs = require('querystringify')
  , demolish = require('demolish')
  , dollars = require('dollars')
  , v4 = require('node-uuid').v4
  , Tick = require('tick-tock')
  , once = require('one-time');

/**
 * Handle handshakes.
 *
 * Options:
 *
 * - `handshake timeout`: Maximum time you're allowed to spend modifying the
 *   handshake.
 * - `stringify`: Encoder for the complete handshake response.
 * - `id`: Unique id generator.
 *
 * @constructor
 * @param {Mixed} context Context of the callbacks.
 * @param {Object} options Optional configuration.
 * @api public
 */
function Handshake(context, options) {
  if (!this) return new Handshake(context, options);

  options = options || {};

  this.stringify = options.stringify || qs.stringify;
  this.configure = Object.create(null);
  this.timers = new Tick(context);
  this.id = options.id || v4;
  this.context = context;
  this.payload = {};

  this.timeout = 'handshake timeout' in options
    ? options['handshake timeout']
    : '5 seconds';

  this.update();
}

/**
 * Configure the default values of the payload. This should contain all the data
 * that needs to be synced with the client. This can also be used to regenerate
 * the defaults when a value has changed.
 *
 * @returns {Handshake}
 * @api public
 */
Handshake.prototype.update = function update() {
  var handshake = this;

  this.payload = Object.keys(handshake.configure)
  .reduce(function each(payload, key) {
    var value = handshake.configure[key];

    if ('function' === typeof value) {
      value = value.call(handshake.context);
    }

    payload[key] = value;
    return payload;
  }, Object.create(null));

  return this;
};

/**
 * Added a safe way of adding properties to the default payload. This will
 * prevent overriding of existing handshake data.
 *
 * @param {String} key Name of the property you want to introduce.
 * @param {Mixed} value Value of the property.
 * @returns {Handshake}
 * @api public
 */
Handshake.prototype.set = function set(key, value) {
  if (value === undefined) {
    throw new Error('Cannot set undefined as value for: '+key);
  }

  this.configure[key] = value;
  return this;
};

/**
 * Get a new handshake response.
 *
 * @param {Function} modify Modification function that can add data to the payload.
 * @param {Function} next Completion callback that received encoded handshake.
 * @returns {Handshake}
 * @api public
 */
Handshake.prototype.get = function get(modify, next) {
  var payload = dollars.object.clone(this.payload)
    , handshake = this
    , id = this.id();

  /**
   * Handle the modified handshake payload and encode it into a string which can
   * be transferred and decoded by a client.
   *
   * @TODO should we handle data that needs to be assigned to a handshake on the
   * server side? If so, we might need to use JSON web tokens instead of uuid's.
   *
   * @param {Error} err Optional error argument which indicates a bad handshake.
   * @param {Object} data Not implemented yet.
   * @api private
   */
  var modified = once(function modified(err, data) {
    handshake.timers.clear(id);

    //
    // We want to encode the error inside the payload so it's transfered to the
    // connected client. This can contain useful debugging information on why
    // the connection was not allowed.
    //
    if (err) payload.error = err.message;

    dollars.catch(function catching() {
      return handshake.stringify(payload);
    }, function catched(failed, data) {
      if (failed) data = handshake.stringify({ error: failed.message });
      next.call(handshake.context, failed || err, data);
    });
  });

  //
  // Allow an (a)synchronous interface. When 2 arguments are assigned in the
  // function we can safely assume that it should be executed in async and we
  // will follow an error first callback pattern. If we operate in sync mode we
  // assume that the returned can be an Error.
  //
  if (modify.length < 2) modified(modify.call(handshake.context, payload));
  else modify.call(handshake.context, payload, modified);

  //
  // Add a timeout
  //
  if (this.timeout) handshake.timers.setTimeout(id, function timeout() {
    modified(new Error('Handshake did not complete in a timely manner.'));
  }, this.timeout);

  return this;
};

/**
 * Destroy the handshake and release all the references it was once holding.
 *
 * @type {Function}
 * @returns {Boolean}
 * @api public
 */
Handshake.prototype.destroy = demolish('stringify configure timers id context payload timeout');

//
// Expose the handshake.
//
module.exports = Handshake;
