'use strict';

var metadata = require('./helpers/metadata');

function set(name, fn){
  /* jshint validthis: true */

  function taskWrapper(){
    return fn.apply(this, arguments);
  }

  var meta = metadata.get(fn) || {};
  var nodes = [];
  if(meta.tree){
    nodes.push(meta.tree);
  }

  metadata.set(taskWrapper, {
    name: name,
    orig: fn,
    tree: {
      label: name,
      type: 'task',
      nodes: nodes
    }
  });

  this.registry.set(name, taskWrapper);
}

module.exports = set;
