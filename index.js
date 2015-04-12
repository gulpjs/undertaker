'use strict';

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

var DefaultRegistry = require('undertaker-registry');

var tree = require('./lib/tree');
var task = require('./lib/task');
var series = require('./lib/series');
var lastRun = require('./lib/last-run');
var parallel = require('./lib/parallel');
var registry = require('./lib/registry');
var _getTask = require('./lib/get-task');
var _setTask = require('./lib/set-task');
var validateRegistry = require('./lib/helpers/validateRegistry');

function Undertaker(Registry){
  EventEmitter.call(this);

  Registry = Registry || DefaultRegistry;

  this._registry = new Registry();

  this._settle = (process.env.UNDERTAKER_SETTLE === 'true');

  validateRegistry(this._registry);
}

inherits(Undertaker, EventEmitter);


Undertaker.prototype.tree = tree;

Undertaker.prototype.task = task;

Undertaker.prototype.series = series;

Undertaker.prototype.lastRun = lastRun;

Undertaker.prototype.parallel = parallel;

Undertaker.prototype.registry = registry;

Undertaker.prototype._getTask = _getTask;

Undertaker.prototype._setTask = _setTask;

module.exports = Undertaker;
