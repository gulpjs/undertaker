'use strict';

var assert = require('assert');

var map = require('arr-map');
var flatten = require('arr-flatten');

function normalizeArgs(registry, args) {
  function getFunction(task) {
    if (typeof task === 'function') {
      return task;
    }

    var fn = registry.get(task);
    assert(fn, 'Task never defined: ' + task);
    return fn;
  }

  var flattenArgs = flatten(args);
  assert(flattenArgs.length, 'Arguments must be a non-empty array or string');

  return map(flattenArgs, getFunction);
}

module.exports = normalizeArgs;
