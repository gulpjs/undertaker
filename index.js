'use strict';

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

var DefaultRegistry = require('undertaker-registry');

var get = require('./lib/get');
var set = require('./lib/set');
var tree = require('./lib/tree');
var task = require('./lib/task');
var series = require('./lib/series');
var lastRun = require('./lib/last-run');
var parallel = require('./lib/parallel');
var registry = require('./lib/registry');
var validateRegistry = require('./lib/helpers/validateRegistry');

function Undertaker(Registry){
  var self = this;

  EventEmitter.call(this);

  Registry = Registry || DefaultRegistry;

  this._registry = new Registry();

  this._settle = (process.env.UNDERTAKER_SETTLE === 'true');

  validateRegistry(this._registry);

  this._lastRuns = {};
  this.on('stop', function(e){
    self._lastRuns[e.name] = e.time;
  });
}

inherits(Undertaker, EventEmitter);

Undertaker.prototype.get = get;

Undertaker.prototype.set = set;

Undertaker.prototype.tree = tree;

Undertaker.prototype.task = task;

Undertaker.prototype.series = series;

Undertaker.prototype.lastRun = lastRun;

Undertaker.prototype.parallel = parallel;

Undertaker.prototype.registry = registry;

module.exports = Undertaker;
