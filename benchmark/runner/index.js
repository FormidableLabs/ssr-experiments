"use strict";
/*eslint-disable no-console, no-magic-numbers, max-nested-callbacks, promise/no-nesting*/

const os = require("os");
const path = require("path");
const table = require("markdown-table");
const strip = require("strip-ansi");
const chalk = require("chalk");
const { cyan, gray, green, magenta, red } = chalk;

// Detect worker threads.
let WORKER_THREADS_ENABLED = true;
try {
  require("worker_threads"); // eslint-disable-line global-require
} catch (e) {
  WORKER_THREADS_ENABLED = false;
}

const { timer, serial } = require("../lib/util");
const sync = require("../impl/sync/index");
const jest = require("../impl/jest-worker/index");
const workerpool = require("../impl/workerpool/index");

// ----------------------------------------------------------------------------
// Globals
// ----------------------------------------------------------------------------
const MAIN_INTERVAL = 1; // ms

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
// Comparisons: exact or "string looks close" (for React with random input)
const compares = {
  "default": (a, b) => a === b,
  comparePrefixAndLength: (a, b) => a.slice(0, 10) === b.slice(0, 10) && a.length === b.length
};

// Table
const stringLength = (cell) => strip(cell).length; // fix alignment with chalk.

// ----------------------------------------------------------------------------
// State
// ----------------------------------------------------------------------------
// TODO: Remove if not needed.
const start = () => Promise.resolve();
const stop = () => Promise.resolve();

// ----------------------------------------------------------------------------
// Matrix
// ----------------------------------------------------------------------------
// Create matrix of implementations to run.
const IMPLS = {
  sync,
  jest,
  workerpool
};
const DEMOS = {
  "react": [
    // { name: "1", repeat: 1 },
    // { name: "5K", repeat: 1 * 1000 },
    { name: "50K", repeat: 50 * 1000 }
  ]
    .filter(Boolean)
    .map((obj) => ({ ...obj, compare: "comparePrefixAndLength" }))
};
const NUM_CPUS = os.cpus().length;
const CONCURRENCY = [
  1,
  NUM_CPUS > 1 ? 2 : null,
  // NUM_CPUS > 2 ? 3 : null,
  NUM_CPUS > 3 ? NUM_CPUS : null
].filter(Boolean);

// Create matrix of `[concurrency, demo, args, impl]`.
const MATRIX = CONCURRENCY.reduce(
  (cMemo, conc) => cMemo.concat(Object.keys(DEMOS).reduce(
    (dMemo, demo) => dMemo.concat(DEMOS[demo].reduce(
      (aMemo, args) => aMemo.concat(Object.keys(IMPLS)
        .map((impl) => ({ conc, demo, args, impl }))
      ), []
    )), []
  )), []
);

// **Alternate Ordering**
// const MATRIX = Object.keys(DEMOS).reduce(
//   (dMemo, demo) => dMemo.concat(DEMOS[demo].reduce(
//     (aMemo, args) => aMemo.concat(Object.keys(IMPLS).reduce(
//       (iMemo, impl) => iMemo.concat(
//         CONCURRENCY.map((conc) => ({ conc, demo, args, impl }))
//       ), []
//     )), []
//   )), []
// );


// ----------------------------------------------------------------------------
// Benchmark!
// ----------------------------------------------------------------------------
//
// Run pairs of (worker + main thread) in serial to accurately time.
const benchmark = module.exports = () => Promise.resolve()
  .then(() => start())
  .then(() => serial(
    MATRIX.map(({ conc, demo, args, impl }) => {
      const implFn = IMPLS[impl];
      let workDone = false;
      let mainCounter = 0;

      return () => Promise.all([
        // Run concurrent workers and time **all** at once.
        timer(() => implFn({
          conc,
          worker: path.resolve(__dirname, "../scenarios", demo, "index.js"),
          args
        }))
          .then((data) => {
            process.stdout.write("."); // progress indicator
            workDone = true;
            return {
              // Inner is _average_ of array values
              innerElapsed: data.result.reduce((m, r) => m + r.elapsed, 0) / data.result.length,
              outerElapsed: data.elapsed,
              result: data.result.map((r) => r.result)
            };
          }),

        // Main thread - increment a counter repeatedly.
        new Promise((resolve) => { // eslint-disable-line promise/avoid-new
          const interval = setInterval(() => {
            mainCounter++;
            if (workDone) {
              clearInterval(interval);
              resolve(mainCounter);
            }
          }, MAIN_INTERVAL);
        })
      ]);
    })
  ))
  .then((results) => {
    const HEADER = ["Demo", "Conc", "Args", "Impl", "M loops", "WI time", "WO time", "W result"]
      .map((t) => gray(t));
    const tableData = [HEADER];

    let syncResult;
    let errors = 0;

    results.forEach((data, i) => { // eslint-disable-line max-statements
      const work = data[0];
      const main = data[1];
      const { args, impl } = MATRIX[i];
      const compare = compares[args.compare] || compares.default;

      // Use first result as gold standard.
      const result = work.result[0];
      if (impl === "sync") {
        syncResult = result;
      }

      const isCorrect =
        // Check other results against first.
        work.result.every((val) => compare(val, result)) &&
        // Check first result against `sync` result
        compare(result, syncResult);

      // Track correctness.
      if (!isCorrect) {
        errors++;
      }

      tableData.push([
        MATRIX[i].demo,
        cyan(MATRIX[i].conc),
        cyan(args.name),
        magenta(impl),
        main,
        Math.floor(work.innerElapsed),
        work.outerElapsed,
        isCorrect ? green("pass") : red("fail")
      ]);
    });

    console.log(chalk`
{cyan ## System information}

* {gray os}: ${os.platform()} ${os.release()} ${os.arch()}
* {gray cpus}: ${NUM_CPUS}
* {gray node}: ${process.version}
* {gray execution}: ${WORKER_THREADS_ENABLED ? "worker thread" : "child process"}

{cyan ## Benchmark}

{gray ### Key}

* {cyan Demo}: Scenario
* {cyan Conc}: Level of concurrency _and_ number of executions
* {cyan Args}: Options passed to worker (e.g. "number of times to repeat")
* {cyan M loops}: Main thread loops on 1ms timer ({green bigger} is better)
* {cyan WI time}: Single worker average "inner" time inside worker ({green smaller} is better)
* {cyan WO time}: Total worker "outer" time across worker ({green smaller} is better)
* {cyan W result}: Correctness vs synchronous baseline

{gray ### Results}
`);

    console.log(`${table(tableData, {
      align: ["l", "r", "r", "l", "r", "r", "r"],
      stringLength
    })}`);

    if (errors) {
      throw new Error(`ERROR: ${errors} executions failed.`);
    }

    return null;
  })
  .then(() => stop())
  .catch((err) => stop().then(() => Promise.reject(err)));

if (require.main === module) {
  benchmark()
    .catch((err) => {
      console.error("ERROR", err.stack || err);
      process.exit(1); // eslint-disable-line no-process-exit
    });
}
