'use strict';

var assert = require('assert');

var _ = require('lodash');

var metadata = require('./helpers/metadata');

function set(name, fn) {
  assert(name, 'Task name must be specified');
  assert(typeof name === 'string', 'Task name must be a string');
  assert(_.isFunction(fn), 'Task function must be specified');

  function taskWrapper() {
    return fn.apply(this, arguments);
  }

  taskWrapper.displayName = name;

  var meta = metadata.get(fn) || {};
  var nodes = [];
  if (meta.branch) {
    nodes.push(meta.tree);
  }

  var task = this._registry.set(name, taskWrapper) || taskWrapper;

  metadata.set(task, {
    name: name,
    orig: fn,
    tree: {
      label: name,
      type: 'task',
      nodes: nodes,
    },
  });
}

module.exports = set;
