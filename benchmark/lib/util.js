"use strict";

const logTimer = require("debug")("ssr:timer");

// Dynamically add types of timers.
const implTimers = {};
const demoTimers = {};

// Timing
// eslint-disable-next-line no-magic-numbers
const hrToMs = (hrtime) => Math.floor((hrtime[0] * 1e9 + hrtime[1]) / 1e6, 0);

// Timer that returns `{ result, elapsed }`.
const timer = (prom, { withLog = false, opts = {} } = {}) => {
  const { impl, demo, type, name } = opts;
  let log;
  if (impl) {
    implTimers[demo] = implTimers[demo] || {};
    implTimers[demo][impl] = implTimers[demo][impl] || logTimer.extend(`${demo}:${impl}`);
    log = implTimers[demo][impl];
  } else {
    demoTimers[demo] = demoTimers[demo] || logTimer.extend(demo);
    log = demoTimers[demo];
  }

  const { pid } = process;
  const start = (new Date()).toISOString();
  const startTime = process.hrtime();
  if (withLog) { log("%o", { type, name, pid, start }); }

  return prom().then((result) => {
    const elapsed = hrToMs(process.hrtime(startTime));
    if (withLog) { log("%o", { type, name, pid, start, elapsed }); }

    return { elapsed, result };
  });
};

// Debugging timer calls like `DEBUG=ssr:timer yarn benchmark` without changing
// result.
const debugTimer = (prom, { opts = {} } = {}) => {
  const { pid } = process;
  const start = (new Date()).toISOString();
  const startTime = hrToMs(process.hrtime());

  return prom().then((result) => {
    logTimer("%o", {
      ...opts,
      pid,
      start,
      elapsed: hrToMs(process.hrtime()) - startTime
    });
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
