"use strict";

const { createElement } = require("react");
const { renderToString } = require("react-dom/server");

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
 * @returns {Promise}           string result in a promise
 */
const render = (opts) => Promise.resolve()
  .then(() => {
    // TODO(BUF): Mutate array buffer.
    throw new Error(JSON.stringify(opts));
    const view = new DataView(opts.buffer);
    view.setInt8(0, 2);
  })
  .then(() => renderToString(createElement(Component, {
    repeat: opts.repeat
  })));

module.exports = {
  render
};

