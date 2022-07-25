'use strict';

var metadata = require('./metadata');

function buildTree(tasks) {
  return Object.values(tasks).reduce(function(ret, task) {
    var meta = metadata.get(task);
    if (meta) {
      ret.push(meta.tree);
      return ret;
    }

    var name = task.displayName || task.name || '<anonymous>';
    meta = {
      name: name,
      tree: {
        label: name,
        type: 'function',
        nodes: [],
      },
    };

    metadata.set(task, meta);
    ret.push(meta.tree);
    return ret;
  }, []);
}

module.exports = buildTree;
