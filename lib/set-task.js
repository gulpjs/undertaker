'use strict';

var assert = require('assert');

var _ = require('lodash');

var metadata = require('./helpers/metadata');

function set(name, fn){
  /* jshint validthis: true */

  assert(name, 'Task name must be specified');
  assert(typeof name === 'string', 'Task name must be a string');
  assert(_.isFunction(fn), 'Task function must be specified');

  var meta = metadata.get(fn) || {};
  var nodes = [];
  if(meta.branch){
    nodes.push(meta.tree);
  } else if (!meta.name) {
    meta.name = fn.displayName || fn.name || '<anonymous>';
    meta.tree = {
      label: meta.name,
      type: 'function',
      nodes: []
    };
    metadata.set(fn, meta);
  }

  var task = this._registry.set(name, fn) || fn;

  if (task === fn) {
    task = fn.bind();
    fn.aliases = fn.aliases || {};
    fn.aliases[name] = task;
  }

  metadata.set(task, {
    name: name,
    orig: fn,
    tree: {
      label: name,
      type: 'task',
      nodes: nodes
    }
  });
}

module.exports = set;
