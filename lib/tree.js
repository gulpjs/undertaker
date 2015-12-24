'use strict';

var _ = require('lodash');

var metadata = require('./helpers/metadata');

function tree(opts, transformer) {
  opts = _.defaults(opts || {}, {
    deep: false,
    depth: null,
  });

  var maxDepth;
  if (!opts.deep) {
    maxDepth = 1;
    if (transformer == null) { transformer = transform_labelOnly; }
  } else if (opts.depth == null || opts.depth > 0) {
    maxDepth = opts.depth;
    if (transformer == null) { transformer = transform_throughPass; }
  } else {
    maxDepth = 0;
    if (transformer == null) { transformer = transform_throughPass; }
  }

  var tasks = _.sortBy(this._registry.tasks(), function(task) {
    var meta = metadata.get(task);
    return meta ? meta.tree.label : '';
  });

  var nodes = _.map(tasks, function(task) {
    var meta = metadata.get(task);
    var node =  {};
    if (task.description) {
      node.description = task.description;
    }
    return treeRcr(node, meta.tree, 1, maxDepth, transformer);
  });

  return {
    label: 'Tasks',
    nodes: nodes,
  };
}

function treeRcr(node, metaTree, depth, maxDepth, transformer) {
  node.label = metaTree.label;
  node.type = metaTree.type;
  node.nodes = [];

  var newNode = transformer(node, metaTree, depth, maxDepth);

  if ((maxDepth == null || depth < maxDepth) && metaTree.nodes) {
    metaTree.nodes.forEach(function(childTree) {
      var child = treeRcr({}, childTree, depth + 1, maxDepth, transformer);
      node.nodes.push(child);
    });
  }

  return newNode;
}

function transform_labelOnly(node, metaTree, depth, maxDepth) {
  return node.label;
}

function transform_throughPass(node, metaTree, depth, maxDepth) {
  return node;
}

module.exports = tree;
