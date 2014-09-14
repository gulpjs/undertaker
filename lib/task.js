'use strict';

function task(name, fn){
  /* jshint validthis: true */
  if(typeof name === 'function'){
    fn = name;
    name = fn.name;
  }

  if(!fn){
    return this.get(name);
  }

  this.set(name, fn);
}

module.exports = task;
