'use strict';

function task(name, fn){
  /* jshint validthis: true */
  if(typeof name === 'function'){
    fn = name;
    name = fn.name || fn.displayName;
  }

  if(!fn){
    return this._getTask(name);
  }

  this._setTask(name, fn);
}

module.exports = task;
