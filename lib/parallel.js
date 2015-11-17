'use strict';

var bach = require('bach');

var metadata = require('./helpers/metadata');
var buildTree = require('./helpers/buildTree');
var normalizeArgs = require('./helpers/normalizeArgs');
var createExtensions = require('./helpers/createExtensions');

function parallel() {
  var create = this._settle ? bach.settleParallel : bach.parallel;

  var args = normalizeArgs(this._registry, arguments);
  var extensions = createExtensions(this);
  var fn = create(args, extensions);
  metadata.set(fn, {
    name: 'parallel',
    branch: true,
    tree: {
      label: '<parallel>',
      type: 'function',
      nodes: buildTree(args),
    },
  });
  return fn;
}

module.exports = parallel;
