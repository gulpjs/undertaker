'use strict';

var assert = require('assert');

var _ = require('lodash');

function validateRegistry(registry){
  assert(_.isFunction(registry.get), 'Custom registry must have `get` function');
  assert(_.isFunction(registry.set), 'Custom registry must have `set` function');
  assert(_.isFunction(registry.tasks), 'Custom registry must have `tasks` function');
}

module.exports = validateRegistry;
