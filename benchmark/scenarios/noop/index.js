"use strict";
/*eslint-disable promise/avoid-new*/

const { timer } = require("../../lib/util");

const DEFAULT_WAIT_MS = 100;

/**
 * A "no op" wait thread.
 *
 * @param {Object} opts         options object
 * @param {Number} opts.wait    time to wait in `ms` (default `100ms`)
 * @returns {Promise}           `{ result<string>, elapsed<Number> }` in a promise
 */
const render = (opts) => timer(
  () => Promise.resolve().then(() => new Promise((resolve) => {
    setTimeout(() => resolve(null), opts.wait || DEFAULT_WAIT_MS);
  })),
  { opts: { type: "scenario", demo: "noop", ...opts }, withLog: true }
);

module.exports = {
  render
};

