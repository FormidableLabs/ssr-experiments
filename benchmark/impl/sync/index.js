"use strict";

const { debugTimer } = require("../../lib/util");

/**
 * Synchronous work **on** the main event loop.
 *
 * Advantages:
 * - No startup cost.
 * - No IPC communication / serialization cost.
 *
 * Disadvantages
 * - Main event loop is blocked during worker action.
 *
 * @param {Object} opts         options object
 * @param {Number} opts.conc    concurrency
 * @param {Number} opts.worker  path to worker script
 * @param {Array}  opts.args    arguments array for worker script
 * @returns {Promise<Array>}    execution result of `conc` runs
 */
module.exports = async ({ conc, worker, args }) => {
  if (!worker) {
    throw new Error("worker script path is required");
  }

  const workerFn = require(worker); // eslint-disable-line global-require

  let opts;
  const results = [];
  for (let i = 0; i < conc; i++) {
    opts = { type: "impl", impl: "sync", ...args };
    results.push(await debugTimer(() => workerFn.render(args), { opts }));
  }

  return results;
};

// For manual testing:
// $ node benchmark/impl/sync 20
if (require.main === module) {
  module.exports({
    conc: 2,
    worker: require.resolve("../../scenarios/react/index"),
    args: {
      // eslint-disable-next-line no-magic-numbers
      repeat: parseInt(process.argv[2] || 1, 10)
    }
  })
    .then((val) => console.log(val)) // eslint-disable-line no-console
    .catch((err) => {
      console.error("ERROR", err.stack || err); // eslint-disable-line no-console
      process.exit(1); // eslint-disable-line no-process-exit
    });
}
