'use strict';

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

var _ = require('lodash');
var bach = require('bach');
var DefaultRegistry = require('undertaker-registry');

var metadata = require('./lib/metadata');
var buildTree = require('./lib/buildTree');
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

  return wrapper;
};

Undertaker.prototype.set = function set(name, fn){
  function taskWrapper(){
    /* jshint validthis: true */
    return fn.apply(this, arguments);
  }

  var meta = metadata.get(fn) || {};
  var nodes = [];
  if(meta.tree){
    nodes.push(meta.tree);
  }

  metadata.set(taskWrapper, {
    name: name,
    orig: fn,
    tree: {
      label: name,
      type: 'task',
      nodes: nodes
    }
  });

  this.registry.set(name, taskWrapper);
};

Undertaker.prototype.tree = function tree(opts){
  opts = _.defaults(opts || {}, {
    deep: false
  });

  var tasks = this.registry.tasks();
  return _.map(tasks, function(task){
    var meta = metadata.get(task);

    if(opts.deep){
      return meta.tree;
    }

    return meta.tree.label;
  });
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
  metadata.set(fn, {
    name: 'series',
    tree: {
      label: '<series>',
      type: 'function',
      nodes: buildTree(args)
    }
  });
  return fn;
};

Undertaker.prototype.parallel = function parallel(){
  var args = normalizeArgs(this.registry, arguments);
  var extensions = createExtensions(this);
  var fn = bach.parallel(args, extensions);
  metadata.set(fn, {
    name: 'parallel',
    tree: {
      label: '<parallel>',
      type: 'function',
      nodes: buildTree(args)
    }
  });
  return fn;
};

module.exports = Undertaker;
