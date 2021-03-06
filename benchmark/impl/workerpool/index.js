"use strict";

const workerpool = require("workerpool");
const { debugTimer } = require("../../lib/util");

// Worker function (stringified and exec'd).
function render(worker, args) { // eslint-disable-line func-style
  const workerFn = require(worker); // eslint-disable-line global-require
  return workerFn.render(args);
}

/**
 * Off-thread execution with child procs or worker threads via
 * [workerpool](https://github.com/josdejong/workerpool)
 *
 * Advantages:
 * - Very easy, usable API (vs. manual forking).
 * - Child procs or workers (with auto-detect).
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

  const pool = workerpool.pool({
    minWorkers: conc,
    maxWorkers: conc
  });

  const concArr = Array.from(new Array(conc));
  const results = await Promise.all(concArr.map(() => {
    const opts = { type: "impl", impl: "workerpool", ...args };
    return debugTimer(() => pool.exec(render, [worker, opts]), { opts });
  }));
  pool.terminate();

  return results;
};

// For manual testing:
// $ node benchmark/impl/workerpool 20
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
