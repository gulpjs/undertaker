'use strict';

var _ = require('lodash');

var metadata = require('./metadata');

function buildTree(tasks){
  return _.map(tasks, function(task){
    var meta = metadata.get(task);
    if(meta){
      return meta.tree;
    }

    meta = {
      tree: {
        label: task.name || '<anonymous>',
        type: 'function',
        nodes: []
      }
    };

    metadata.set(task, meta);
    return meta.tree;
  });
}

module.exports = buildTree;
