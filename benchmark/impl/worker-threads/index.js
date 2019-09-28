"use strict";

const { debugTimer } = require("../../lib/util");

/**
 * Manual worker threads implementation using `ArrayBuffer`.
 *
 * Advantages:
 * - TODO
 *
 * Disadvantages
 * - TODO
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

  const results = [];
  for (let i = 0; i < conc; i++) {
    results.push(await debugTimer(
      { type: "worker-render", demo: "sync", ...args },
      () => workerFn.render(args)
    ));
  }

  return results;
};

// For manual testing:
// $ node benchmark/impl/worker-threads 20
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
