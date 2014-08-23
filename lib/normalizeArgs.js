'use strict';

var _ = require('lodash');

function normalizeArgs(registry, args){
  function getFunction(task){
    if(typeof task === 'function'){
      return task;
    }

    return registry.get(task);
  }

  return _.map(_.flatten(args), getFunction);
}

module.exports = normalizeArgs;
