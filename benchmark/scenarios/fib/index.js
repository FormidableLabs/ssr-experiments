"use strict";

const { timer } = require("../../lib/util");
const implLog = require("debug")("ssr:impl:noop");

// A canonical, naive implementation.
// eslint-disable-next-line no-magic-numbers
const fib = (n) => n <= 1 ? n : fib(n - 1) + fib(n - 2);

/**
 * A recursive, unoptimized Fibonacci implementation.
 *
 * The goal here is to create something large that will have a significant
 * CPU cost.
 *
 * @param {Object} opts         options object
 * @param {Number} opts.number  Fibonacci number to calculate
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
  .then(() => fib(opts.number || 0))
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

