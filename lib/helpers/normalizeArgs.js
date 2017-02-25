'use strict';

var assert = require('assert');

var map = require('collection-map');
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

  return map(flatten(args), getFunction);
}

module.exports = normalizeArgs;
