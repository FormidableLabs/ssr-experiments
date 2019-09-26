"use strict";
/*eslint-disable no-magic-numbers, max-nested-callbacks, promise/no-nesting*/

const os = require("os");
const path = require("path");
const table = require("markdown-table");
const strip = require("strip-ansi");
const { cyan, gray, green, magenta, red } = require("chalk");

const sync = require("../impl/sync/index");

// ----------------------------------------------------------------------------
// Globals
// ----------------------------------------------------------------------------
const MAIN_INTERVAL = 1; // ms

const TABLE_OPTS = {
  align: ["r", "l", "r", "l", "r", "r", "r"],
  stringLength: (cell) => strip(cell).length // fix alignment with chalk.
};

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
// Comparisons: exact or "string looks close" (for React with random input)
const defaultCompare = (a, b) => a === b;
const comparePrefixAndLength = (a, b) =>
  a.slice(0, 10) === b.slice(0, 10) && a.length === b.length;

// Timing
const hrToMs = (hrtime) => Math.floor((hrtime[0] * 1e9 + hrtime[1]) / 1e6, 0);
const timer = (prom) => {
  const startTime = process.hrtime();

  return prom().then((result) => ({
    elapsed: hrToMs(process.hrtime(startTime)),
    result
  }));
};

// Run promises in serial.
const serial = (proms) => {
  const results = [];
  return proms
    // Add promises in serial. Accumulate results.
    .reduce( // eslint-disable-next-line promise/always-return
      (memo, prom) => memo.then(prom).then((r) => { results.push(r); }),
      Promise.resolve()
    )
    // Return ordered results, like `Promise.all()`.
    .then(() => results);
};

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
  sync
};
const DEMOS = {
  "react": [
    { name: "1", repeat: 1, compare: comparePrefixAndLength },
    { name: "1K", repeat: 1000, compare: comparePrefixAndLength }
    // TODO: More scenarios
    // { name: "10K", repeat: 10 * 1000 },
    // { name: "50K", repeat: 50 * 1000 }
  ].filter(Boolean)
};
const NUM_CPUS = os.cpus().length;
const CONCURRENCY = [
  1,
  NUM_CPUS > 1 ? 2 : null,
  NUM_CPUS > 2 ? NUM_CPUS : null
].filter(Boolean);

// Create matrix of `[concurrency, demo, args, impl]`.
const MATRIX = Object.keys(DEMOS).reduce(
  (dMemo, dKey) => dMemo.concat(DEMOS[dKey].reduce(
    (aMemo, opts) => aMemo.concat(Object.keys(IMPLS).reduce(
      (iMemo, impl) => iMemo.concat(
        CONCURRENCY.map((con) => [con, dKey, opts, impl])
      ), []
    )), []
  )), []
);

// TODO: REMOVE OR REINSTATE (old order `[concurrency, demo, args, impl]`)
// const MATRIX_OLD = CONCURRENCY.reduce(
//   (cMemo, con) => cMemo.concat(Object.keys(DEMOS).reduce(
//     (dMemo, dKey) => dMemo.concat(DEMOS[dKey].reduce(
//       (aMemo, opts) => aMemo.concat(Object.keys(IMPLS)
//         .map((impl) => [con, dKey, opts, impl])
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
    MATRIX.map((exp) => {
      const conc = exp[0];
      const concArr = Array.from(new Array(conc));
      const demo = exp[1];
      const args = exp[2];
      const impl = exp[3];
      let implFn = IMPLS[impl];
      let opts;

      // Allow for implementation objects.
      if (typeof implFn !== "function") {
        opts = implFn.opts;
        implFn = implFn.impl;
      }

      let workDone = false;
      let mainCounter = 0;

      return () => Promise.all([
        // Run concurrent workers and time **all** at once.
        timer(() => Promise.all(concArr.map(() =>
          implFn(Object.assign({
            worker: path.resolve(__dirname, "../scenarios", demo, "index.js"),
            args
          }, opts))
            .then((result) => {
              process.stdout.write("."); // progress indicator
              return result;
            })
        )))
          .then((data) => {
            workDone = true;
            return {
              elapsed: data.elapsed,
              result: data.result
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
    const HEADER = ["Conc", "Demo", "Args", "Impl", "M loops", "W time", "W result"]
      .map((t) => gray(t));
    const tableData = [HEADER];

    let syncResult;
    let errors = 0;

    results.forEach((data, i) => { // eslint-disable-line max-statements
      const work = data[0];
      const main = data[1];
      const args = MATRIX[i][2];
      const compare = args.compare || defaultCompare;
      const impl = MATRIX[i][3];

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
        cyan(MATRIX[i][0]),
        cyan(MATRIX[i][1]),
        magenta(args.name),
        magenta(impl),
        main,
        work.elapsed,
        isCorrect ? green("pass") : red("fail")
      ]);
    });

    console.log(`\n${table(tableData, TABLE_OPTS)}`); // eslint-disable-line no-console

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
      console.error("ERROR", err.stack || err); // eslint-disable-line no-console
      process.exit(1); // eslint-disable-line no-process-exit
    });
}
