"use strict";

const { createElement } = require("react");
const { renderToString } = require("react-dom/server");

const randomColor = () => // eslint-disable-next-line no-magic-numbers, prefer-template
  "#" + ("00000" + Math.floor(Math.random() * 0x1000000).toString(16)).substr(-6);

const Component = ({ repeat }) => { // eslint-disable-line object-shorthand
  return (new Array(repeat)).fill(null).map(() => createElement(
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
};

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
module.exports = ({ repeat }) => Promise.resolve()
  .then(() => renderToString(createElement(Component, {
    repeat
  })));

if (require.main === module) {
  // node benchmark/scenarios/react.js NUMBER
  module.exports({ repeat: parseInt(process.argv[2] || 1, 10) })
    .then((val) => console.log(val))
    .catch((err) => {
      console.error("ERROR", err.stack || err); // eslint-disable-line no-console
      process.exit(1); // eslint-disable-line no-process-exit
    });
}