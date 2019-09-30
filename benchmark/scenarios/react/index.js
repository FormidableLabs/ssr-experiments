"use strict";

const { createElement } = require("react");
const { renderToString } = require("react-dom/server");

const { timer } = require("../../lib/util");
const implLog = require("debug")("ssr:impl:react");

const randomColor = () => // eslint-disable-next-line no-magic-numbers, prefer-template
  "#" + ("00000" + Math.floor(Math.random() * 0x1000000).toString(16)).substr(-6);

const Component = ({ repeat }) => (new Array(repeat)).fill(null).map(() => createElement(
  "div",
  null,
  createElement(
    "button",
    { style: { color: randomColor() } },
    "Button"
  ),
  createElement(
    "a",
    { style: { backgroundColor: randomColor() } },
    "I'm a link"
  )
));

/**
 * A simple string repeater.
 *
 * The goal here is to create something large that will have a significant
 * serialization cost.
 *
 * @param {Object} opts         options object
 * @param {Number} opts.repeat  number of times to repeat string.
 * @returns {Promise}           `{ result<string>, elapsed<Number> }` in a promise
 */
const render = (opts) => timer(() => Promise.resolve()
  .then(() => {
    // TODO: Abstract to general wrapper.
    implLog(`Impl start: ${JSON.stringify({
      start: (new Date()).toISOString(),
      pid: process.pid
      // isMainThread: "TODO: FOR WORKERS",
      // env: process.env
    })}`);
  })
  .then(() => renderToString(createElement(Component, {
    repeat: opts.repeat
  })))
  .then((val) => {
    // TODO: Abstract to general wrapper.
    implLog(`Impl end: ${JSON.stringify({
      end: (new Date()).toISOString(),
      pid: process.pid
    })}`);
    return val;
  })
);

module.exports = {
  render
};

