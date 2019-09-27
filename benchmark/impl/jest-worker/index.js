"use strict";

const Worker = require("jest-worker").default;
const { debugTimer } = require("../../lib/util");

/**
 * Off-thread execution with child procs or worker threads via
 * [jest-worker](https://github.com/facebook/jest/tree/master/packages/jest-worker)
 *
 * Advantages:
 * - Very easy, usable API (vs. manual forking).
 * - Child procs or workers.
 *
 * Disadvantages
 * - Some startup cost for the worker pool.
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
    // TODO: This currently fails on Node12 with DataCloneError.
    // Currently _does_ work on node10 with `yarn benchmark --experimental-worker`
    // , enableWorkerThreads: true // use workers if available
  });

  const concArr = Array.from(new Array(conc));
  const results = await Promise.all(concArr.map(() =>
    debugTimer({ type: "worker-render", demo: "jest", ...args }, () => workerFn.render(args))
  ));
  workerFn.end(); // Note: Seems to take "no time".

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
