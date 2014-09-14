'use strict';

var lab = exports.lab = require('lab').script();
var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var beforeEach = lab.beforeEach;
var after = lab.after;
var afterEach = lab.afterEach;
var expect = require('lab').expect;

var Undertaker = require('../');

var DefaultRegistry = require('undertaker-registry');
var CommonRegistry = require('undertaker-common-tasks');

function noop(){}

function CustomRegistry(){}
CustomRegistry.prototype.get = noop;
CustomRegistry.prototype.set = noop;
CustomRegistry.prototype.tasks = noop;

function InvalidRegistry(){}

describe('registry', function(){

  describe('method', function(){

    it('should return the current registry when no arguments are given', function(done){
      var taker = new Undertaker();
      expect(taker.registry()).to.equal(taker._registry);
      done();
    });

    it('should set the registry to the given registry instance argument', function(done){
      var taker = new Undertaker();
      var customRegistry = new CustomRegistry();
      taker.registry(customRegistry);
      expect(taker.registry()).to.equal(customRegistry);
      done();
    });

    it('should validate the custom registry instance', function(done){
      var taker = new Undertaker();
      var invalid = new InvalidRegistry();

      function invalidSet(){
        taker.registry(invalid);
      }

      expect(invalidSet).to.throw(Error, 'Custom registry must have `get` function');
      done();
    });

    it('should transfer all tasks from old registry to new', function(done){
      var taker = new Undertaker(CommonRegistry);
      var customRegistry = new DefaultRegistry();
      taker.registry(customRegistry);

      expect(customRegistry.get('clean')).to.be.a('function');
      expect(customRegistry.get('serve')).to.be.a('function');
      done();
    });
  });

  describe('constructor', function(){

    it('should take a custom registry constructor on instantiation', function(done){
      var taker = new Undertaker(CustomRegistry);
      expect(taker.registry()).to.be.an.instanceof(CustomRegistry);
      expect(taker.registry()).to.not.be.an.instanceof(DefaultRegistry);
      done();
    });

    it('should default to undertaker-registry if not constructed with custom registry', function(done){
      var taker = new Undertaker();
      expect(taker.registry()).to.be.an.instanceof(DefaultRegistry);
      expect(taker.registry()).to.not.be.an.instanceof(CustomRegistry);
      done();
    });

    it('should take a registry that pre-defines tasks', function(done){
      var taker = new Undertaker(CommonRegistry);
      expect(taker.registry()).to.be.an.instanceof(CommonRegistry);
      expect(taker.registry()).to.be.an.instanceof(DefaultRegistry);
      expect(taker.get('clean')).to.be.a('function');
      expect(taker.get('serve')).to.be.a('function');
      done();
    });

    it('should throw upon invalid registry', function(done){
      function noGet(){
        var taker = new Undertaker(InvalidRegistry);
      }

      expect(noGet).to.throw(Error, 'Custom registry must have `get` function');
      InvalidRegistry.prototype.get = noop;

      function noSet(){
        var taker = new Undertaker(InvalidRegistry);
      }

      expect(noSet).to.throw(Error, 'Custom registry must have `set` function');
      InvalidRegistry.prototype.set = noop;

      function noTasks(){
        var taker = new Undertaker(InvalidRegistry);
      }

      expect(noTasks).to.throw(Error, 'Custom registry must have `tasks` function');
      InvalidRegistry.prototype.tasks = noop;

      var taker = new Undertaker(InvalidRegistry);
      done();
    });
  });

});
