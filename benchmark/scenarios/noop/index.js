"use strict";

const { timer } = require("../../lib/util");
const implLog = require("debug")("ssr:impl:noop");

const DEFAULT_WAIT_MS = 100;

/**
 * A "no op" wait thread.
 *
 * @param {Object} opts         options object
 * @param {Number} opts.wait    time to wait in `ms` (default `100ms`)
 * @returns {Promise}           `{ result<string>, elapsed<Number> }` in a promise
 */
const render = (opts) => timer(() => Promise.resolve()
  .then(() => {
    // TODO: Abstract to general wrapper.
    implLog(`Impl start: ${JSON.stringify({
      start: (new Date()).toISOString(),
      pid: process.pid
      // isMainThread: "TODO: FOR WORKERS",
      // env: process.env
    })}`);
  })
  .then(() => new Promise((resolve) => {
    setTimeout(() => resolve(null), opts.wait || DEFAULT_WAIT_MS);
  }))
  .then((val) => {
    // TODO: Abstract to general wrapper.
    implLog(`Impl end: ${JSON.stringify({
      end: (new Date()).toISOString(),
      pid: process.pid
    })}`);
    return val;
  })
);

module.exports = {
  render
};

