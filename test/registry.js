'use strict';

var expect = require('expect');

var Undertaker = require('../');

var DefaultRegistry = require('undertaker-registry');
var CommonRegistry = require('undertaker-common-tasks');
var MetadataRegistry = require('undertaker-task-metadata');

function noop() {}

function CustomRegistry() {}
CustomRegistry.prototype.init = noop;
CustomRegistry.prototype.get = noop;
CustomRegistry.prototype.set = noop;
CustomRegistry.prototype.tasks = noop;

function SetNoReturnRegistry() {
  this._tasks = {};
}
SetNoReturnRegistry.prototype.init = noop;
SetNoReturnRegistry.prototype.get = function(name) {
  return this.tasks[name];
};
SetNoReturnRegistry.prototype.set = function(name, fn) {
  this.tasks[name] = fn;
};
SetNoReturnRegistry.prototype.tasks = noop;

function InvalidRegistry() {}

function InvalidProtoRegistry() {}
InvalidProtoRegistry.prototype = InvalidRegistry;

describe('registry', function() {

  describe('method', function() {

    it('should return the current registry when no arguments are given', function(done) {
      var taker = new Undertaker();
      expect(taker.registry()).toEqual(taker._registry);
      done();
    });

    it('should set the registry to the given registry instance argument', function(done) {
      var taker = new Undertaker();
      var customRegistry = new CustomRegistry();
      taker.registry(customRegistry);
      expect(taker.registry()).toEqual(customRegistry);
      done();
    });

    it('should validate the custom registry instance', function(done) {
      var taker = new Undertaker();
      var invalid = new InvalidRegistry();

      function invalidSet() {
        taker.registry(invalid);
      }

      expect(invalidSet).toThrow('Custom registry must have `get` function');
      done();
    });

    it('should transfer all tasks from old registry to new', function(done) {
      var taker = new Undertaker(new CommonRegistry());
      var customRegistry = new DefaultRegistry();
      taker.registry(customRegistry);

      expect(typeof taker.task('clean')).toEqual('function');
      expect(typeof taker.task('serve')).toEqual('function');
      done();
    });

    it('allows multiple custom registries to used', function(done) {
      var taker = new Undertaker();
      taker.registry(new CommonRegistry());

      expect(typeof taker.task('clean')).toEqual('function');
      expect(typeof taker.task('serve')).toEqual('function');

      taker.registry(new MetadataRegistry());
      taker.task('context', function(cb) {
        expect(this).toEqual({ name: 'context' });
        cb();
        done();
      });

      taker.registry(new DefaultRegistry());

      expect(typeof taker.task('clean')).toEqual('function');
      expect(typeof taker.task('serve')).toEqual('function');
      expect(typeof taker.task('context')).toEqual('function');

      taker.series('context')();
    });

    it('throws with a descriptive method when constructor is passed', function(done) {
      var taker = new Undertaker();

      function ctor() {
        taker.registry(CommonRegistry);
      }

      expect(ctor).toThrow('Custom registries must be instantiated, but it looks like you passed a constructor');
      done();
    });

    it('calls into the init function after tasks are transferred', function(done) {
      var taker = new Undertaker(new CommonRegistry());

      var ogInit = DefaultRegistry.prototype.init;

      DefaultRegistry.prototype.init = function(inst) {
        expect(inst).toEqual(taker);
        expect(typeof inst.task('clean')).toEqual('function');
        expect(typeof inst.task('serve')).toEqual('function');
      };

      taker.registry(new DefaultRegistry());

      DefaultRegistry.prototype.init = ogInit;
      done();
    });
  });

  describe('constructor', function() {
    it('should take a custom registry on instantiation', function(done) {
      var taker = new Undertaker(new CustomRegistry());
      expect(taker.registry()).toBeInstanceOf(CustomRegistry);
      expect(taker.registry()).not.toBeInstanceOf(DefaultRegistry);
      done();
    });

    it('should default to undertaker-registry if not constructed with custom registry', function(done) {
      var taker = new Undertaker();
      expect(taker.registry()).toBeInstanceOf(DefaultRegistry);
      expect(taker.registry()).not.toBeInstanceOf(CustomRegistry);
      done();
    });

    it('should take a registry that pre-defines tasks', function(done) {
      var taker = new Undertaker(new CommonRegistry());
      expect(taker.registry()).toBeInstanceOf(CommonRegistry);
      expect(taker.registry()).toBeInstanceOf(DefaultRegistry);
      expect(typeof taker.task('clean')).toEqual('function');
      expect(typeof taker.task('serve')).toEqual('function');
      done();
    });

    it('should throw upon invalid registry', function(done) {
      var taker = new Undertaker(new CommonRegistry());
      expect(function() {
        taker.registry(new InvalidProtoRegistry());
      }).toThrow('Custom registry must have `get` function');
      done();
    });

    it('should throw upon invalid registry', function(done) {
      /* eslint no-unused-vars: 0 */
      var taker;

      function noGet() {
        taker = new Undertaker(new InvalidRegistry());
      }

      expect(noGet).toThrow('Custom registry must have `get` function');
      InvalidRegistry.prototype.get = noop;

      function noSet() {
        taker = new Undertaker(new InvalidRegistry());
      }

      expect(noSet).toThrow('Custom registry must have `set` function');
      InvalidRegistry.prototype.set = noop;

      function noInit() {
        taker = new Undertaker(new InvalidRegistry());
      }

      expect(noInit).toThrow('Custom registry must have `init` function');
      InvalidRegistry.prototype.init = noop;

      function noTasks() {
        taker = new Undertaker(new InvalidRegistry());
      }

      expect(noTasks).toThrow('Custom registry must have `tasks` function');
      InvalidRegistry.prototype.tasks = noop;

      taker = new Undertaker(new InvalidRegistry());
      done();
    });
  });

  it('does not require the `set` method to return a task', function(done) {
    var taker = new Undertaker();
    taker.registry(new SetNoReturnRegistry());
    taker.task('test', noop);
    taker.on('start', function(data) {
      expect(data.name).toEqual('test');
      done();
    });
    taker.series('test')();
  });

  it('should fail and offer tasks which are close in name', function(done) {
    var taker = new Undertaker(new CommonRegistry());
    var customRegistry = new DefaultRegistry();
    taker.registry(customRegistry);

    function fail() {
      taker.series('clear');
    }

    expect(fail).toThrow(/Task never defined: clear - did you mean\? clean/);
    done();
  });
});
