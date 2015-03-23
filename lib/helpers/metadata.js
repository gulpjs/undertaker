'use strict';

var WM = require('es6-weak-map');

// WeakMap for storing metadata
var metadata = new WM();
var origTaskId = new WM();
var uid = 1;

module.exports = {
  get: function(key) {
    return metadata.get(key);
  },

  set: function(key, value) {
    var ref = value.orig ? value.orig : key;
    value.taskId = origTaskId.get(ref) || uid++;

    if (value.orig && !origTaskId.has(ref)) {
      origTaskId.set(ref, value.taskId);
    }

    return metadata.set(key, value);
  },

  getTaskId: function(key) {
    var meta = metadata.get(key);
    return meta ? meta.taskId : origTaskId.get(key);
  }
};
