"use strict";

const logTimer = require("debug")("ssr:timer");

// Timing
// eslint-disable-next-line no-magic-numbers
const hrToMs = (hrtime) => Math.floor((hrtime[0] * 1e9 + hrtime[1]) / 1e6, 0);

const timer = (prom) => {
  const startTime = process.hrtime();

  return prom().then((result) => ({
    elapsed: hrToMs(process.hrtime(startTime)),
    result
  }));
};

// Debugging timer calls like `DEBUG=ssr:timer yarn benchmark`
const debugTimer = (args, prom) => {
  const startTime = hrToMs(process.hrtime());

  return prom().then((result) => {
    logTimer(`${JSON.stringify(args)}: Elapsed: ${hrToMs(process.hrtime()) - startTime}`);
    return result;
  });
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

module.exports = {
  hrToMs,
  timer,
  debugTimer,
  serial
};
