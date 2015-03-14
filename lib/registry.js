'use strict';

var _ = require('lodash');

var validateRegistry = require('./helpers/validateRegistry');

function setTasks(inst, task, name){
  inst.set(name, task);
}

function registry(newRegistry){
  /* jshint validthis: true */
  if(!newRegistry){
    return this._registry;
  }

  validateRegistry(newRegistry);

  var tasks = this._registry.tasks();

  this._registry = _.transform(tasks, setTasks, newRegistry);
}

module.exports = registry;
