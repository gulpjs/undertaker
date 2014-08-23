'use strict';

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

var bach = require('bach');
var DefaultRegistry = require('undertaker-registry');

var metadata = require('./lib/metadata');
var normalizeArgs = require('./lib/normalizeArgs');
var createExtensions = require('./lib/createExtensions');

function Undertaker(Registry){
  EventEmitter.call(this);

  Registry = Registry || DefaultRegistry;

  this.registry = new Registry();
}

inherits(Undertaker, EventEmitter);

Undertaker.prototype.get = function get(name){
  var wrapper = this.registry.get(name);

  if(!wrapper){
    return;
  }

  var meta = metadata.get(wrapper);

  if(meta){
    return meta.orig;
  }
};

Undertaker.prototype.set = function set(name, fn){
  function taskWrapper(){
    /* jshint validthis: true */
    return fn.apply(this, arguments);
  }

  metadata.set(taskWrapper, {
    name: name,
    orig: fn
  });

  this.registry.set(name, taskWrapper);
};

Undertaker.prototype.task = function task(name, fn){
  if(typeof name === 'function'){
    fn = name;
    name = fn.name;
  }

  if(!fn){
    return this.get(name);
  }

  this.set(name, fn);
};

Undertaker.prototype.series = function series(){
  var args = normalizeArgs(this.registry, arguments);
  var extensions = createExtensions(this);
  var fn = bach.series(args, extensions);
  metadata.set(fn, { name: 'series' });
  return fn;
};

Undertaker.prototype.parallel = function parallel(){
  var args = normalizeArgs(this.registry, arguments);
  var extensions = createExtensions(this);
  var fn = bach.parallel(args, extensions);
  metadata.set(fn, { name: 'parallel' });
  return fn;
};

module.exports = Undertaker;
