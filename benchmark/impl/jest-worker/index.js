"use strict";

const Worker = require("jest-worker").default;

/**
 * Asynchronous work using worker threads when available,
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

  const workerFn = new Worker(require.resolve(worker), {
    numWorkers: conc
  });

  const concArr = Array.from(new Array(conc));
  const results = await Promise.all(concArr.map(() => workerFn.render(args)));
  workerFn.end(); // TODO: Move out of timed implementation.

  return results;
};

// For manual testing:
// $ node benchmark/impl/jest-worker 20
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
