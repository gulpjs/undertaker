'use strict';

var assert = require('assert');

var _ = require('lodash');

var metadata = require('./helpers/metadata');

function set(name, fn){
  /* jshint validthis: true */

  assert(name, 'Task name must be specified');
  assert(typeof name === 'string', 'Task name must be a string');
  assert(_.isFunction(fn), 'Task function must be specified');

  var task = this._registry.set(name, fn) || fn;

  var meta = metadata.get(fn) || {};
  var nodes = [];
  if(meta.tree){
    if(meta.tree.type === 'function')
      nodes.push(meta.tree);
    else {
      // if a task referring to this js function exists - just add label to the list of aliases
      if(_.isArray(meta.tree.label))
        meta.tree.label.push(name);
      else
        meta.tree.label = [meta.tree.label, name];
      return;
    }
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
