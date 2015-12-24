'use strict';

var assert = require('assert');

var _ = require('lodash');

var metadata = require('./helpers/metadata');

function set(name, fn) {
  assert(name, 'Task name must be specified');
  assert(typeof name === 'string', 'Task name must be a string');
  assert(_.isFunction(fn), 'Task function must be specified');

  var task = createTask(this, name, fn);

  var meta = metadata.get(fn) || {};
  var nodes = [];
  if (meta.branch) {
    nodes.push(meta.tree);
  }

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

function createTask(taker, name, fn) {
  function task() {
    return fn.apply(this, arguments);
  };
  task.displayName = name;
  if (fn.description) {
    task.description = fn.description;
  }

  return taker._registry.set(name, task) || task;
}

module.exports = set;
