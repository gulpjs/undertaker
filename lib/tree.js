'use strict';

var metadata = require('./helpers/metadata');

function tree(opts) {
  opts = Object.assign({ deep: false }, opts);

  var tasks = this._registry.tasks();
  var nodes = Object.values(tasks).reduce(function(ret, task) {
    var meta = metadata.get(task);

    if (opts.deep) {
      ret.push(meta.tree);
      return ret;
    }

    ret.push(meta.tree.label);
    return ret;
  }, []);

  return {
    label: 'Tasks',
    nodes: nodes,
  };
}

module.exports = tree;
