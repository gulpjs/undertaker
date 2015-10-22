'use strict';

var assert = require('assert');

var metadata = require('./metadata');
var _ = require('lodash');

function normalizeArgs(registry, args){
  function getFunction(task){
    if(typeof task === 'function'){
      return task;
    }

    var fn = registry.get(task);
    var aliases = fn && metadata.aliases.get(fn);
    if (aliases) {
      fn = aliases[task];
    }
    assert(fn, 'Task never defined: ' + task);
    return fn;
  }

  return _.map(_.flatten(args), getFunction);
}

module.exports = normalizeArgs;
