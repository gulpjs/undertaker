'use strict';

function task(name, fn) {
  if (typeof name === 'function') {
    fn = name;
    name = fn.displayName || fn.name;
  }

  if (fn) {
    this._setTask(name, fn);
  }

  return this._registry.get(name);
}

module.exports = task;
