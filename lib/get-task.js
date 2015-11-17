'use strict';

var metadata = require('./helpers/metadata');

function get(name) {
  var wrapper = this._registry.get(name);

  if (!wrapper) {
    return;
  }

  var meta = metadata.get(wrapper);

  if (meta) {
    return meta.orig;
  }

  return wrapper;
}

module.exports = get;
