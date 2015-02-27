'use strict';

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

var DefaultRegistry = require('undertaker-registry');

var get = require('./lib/get');
var set = require('./lib/set');
var tree = require('./lib/tree');
var task = require('./lib/task');
var series = require('./lib/series');
var parallel = require('./lib/parallel');
var registry = require('./lib/registry');
var validateRegistry = require('./lib/helpers/validateRegistry');

function Undertaker(Registry){
  var self = this;

  EventEmitter.call(this);

  Registry = Registry || DefaultRegistry;

  this._registry = new Registry();

  validateRegistry(this._registry);

  this._last_runs = {};
  this.on('stop', function(e) {
    self._last_runs[e.name] = e;
  });
}

inherits(Undertaker, EventEmitter);

Undertaker.prototype.get = get;

Undertaker.prototype.set = set;

Undertaker.prototype.tree = tree;

Undertaker.prototype.task = task;

Undertaker.prototype.series = series;

Undertaker.prototype.parallel = parallel;

Undertaker.prototype.registry = registry;

module.exports = Undertaker;
