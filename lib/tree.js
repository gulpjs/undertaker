'use strict';

var _ = require('lodash');

var metadata = require('./helpers/metadata');

function tree(opts) {
  opts = _.defaults(opts || {}, {
    deep: false,
    depth: null,
  });

  var tasks = this._registry.tasks();

  var nodes;
  if (!opts.deep) {
    nodes = _.map(tasks, function(task) {
      var meta = metadata.get(task);
      return meta ? meta.tree.label : '';
    });
  } else {
    var maxDepth = (opts.depth == null || opts.depth > 0) ? opts.depth : 1;
    nodes = _.map(this._registry.tasks(), function(task) {
      var node = {};
      var meta = metadata.get(task);
      if (!meta) {
        return node;
      }
      if (meta.orig) {
        if (meta.orig.description) {
          node.description = meta.orig.description;
        }
        if (meta.orig.flag) {
          node.flag = meta.orig.flag;
        }
      }
      return treeRcr(node, meta.tree, 1, maxDepth);
    });
  }

  return {
    label: 'Tasks',
    nodes: nodes,
  };
}

function treeRcr(node, metaTree, depth, maxDepth) {
  node.label = metaTree.label;
  node.type = metaTree.type;
  node.nodes = [];

  if ((maxDepth == null || depth < maxDepth) && metaTree.nodes) {
    metaTree.nodes.forEach(function(childTree) {
      var child = treeRcr({}, childTree, depth + 1, maxDepth);
      node.nodes.push(child);
    });
  }

  return node;
}

module.exports = tree;
