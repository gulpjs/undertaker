'use strict';

var assert = require('assert');

var levenshtein = require('fast-levenshtein');

function normalizeArgs(registry, args) {
  function getFunction(task) {
    if (typeof task === 'function') {
      return task;
    }

    var fn = registry.get(task);
    if (!fn) {
      var similar = similarTasks(registry, task);
      if (similar.length > 0) {
        assert(false, 'Task never defined: ' + task + ' - did you mean? ' + similar.join(', '));
      } else {
        assert(false, 'Task never defined: ' + task);
      }
    }
    return fn;
  }

  var flattenArgs = flatten(args);
  assert(flattenArgs.length, 'One or more tasks should be combined using series or parallel');

  return flattenArgs.map(getFunction);
}

function similarTasks(registry, queryTask) {
  if (typeof queryTask !== 'string') {
    return [];
  }

  var tasks = registry.tasks();
  var similarTasks = [];
  for (var task in tasks) {
    if (Object.prototype.hasOwnProperty.call(tasks, task)) {
      var distance = levenshtein.get(task, queryTask);
      var allowedDistance = Math.floor(0.4 * task.length) + 1;
      if (distance < allowedDistance) {
        similarTasks.push(task);
      }
    }
  }
  return similarTasks;
}

function flatten(arr, ret) {
  ret = ret || [];
  for (var i = 0, n = arr.length; i < n; i++) {
    var el = arr[i];
    if (Array.isArray(el)) {
      flatten(el, ret);
    } else {
      ret.push(el)
    }
  }
  return ret;
}

module.exports = normalizeArgs;
