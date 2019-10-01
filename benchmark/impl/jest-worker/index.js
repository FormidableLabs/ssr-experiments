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
 * Notes:
 * - **Research**: More concurrency is unexpectedly slower for `jest-worker`
 *   (https://github.com/FormidableLabs/ssr-experiments/issues/2)
 *   Currently, having **more** concurrency up to "num CPUs" is slower in
 *   parallel when it seemingly shouldn't. I've manually verified that the
 *   concurrency runs fine for timed no-ops and things seem to be functioning
 *   the same way, but we end up with (for a 4 CPU machine for 50K render):
 *     - concurrency 1 render: `1429` ms
 *     - concurrency 2 render: `1816` ms
 *     - concurrency 3 render: `2934` ms (informational, currently disabled)
 *     - concurrency 4 render: `5160` ms
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
    numWorkers: conc,
    enableWorkerThreads: true, // use workers if available
    forkOptions: {
      stdio: "inherit" // allow in-proc console.log to show in parent terminal
    }
  });

  const concArr = Array.from(new Array(conc));
  const results = await Promise.all(concArr.map(() => {
    const opts = { type: "impl", impl: "jest", ...args };
    return debugTimer(() => workerFn.render(opts), { opts });
  }));
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
