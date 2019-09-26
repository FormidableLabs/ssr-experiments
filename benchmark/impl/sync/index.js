"use strict";

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
 * @param {Number} opts.worker  path to worker script
 * @param {Array}  opts.args    arguments array for worker script
 * @returns {Promise}           execution result in a promise
 */
module.exports = ({ worker, args }) => {
  if (!worker) {
    return Promise.reject(new Error("worker script path is required"));
  }

  let workerFn;
  try {
    workerFn = require(worker); // eslint-disable-line global-require
  } catch (err) {
    return Promise.reject(err);
  }

  return workerFn(args);
};
