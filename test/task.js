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

function noop(done){
  done();
}

describe('task', function(){

  var taker;

  beforeEach(function(done){
    taker = new Undertaker();
    done();
  });

  it('should register a named function', function(done){
    taker.task(noop);
    expect(taker.task('noop')).to.equal(noop);
    done();
  });

  it('should register an anonymous function by string name', function(done){
    var fn = function(){};
    taker.task('test1', fn);
    expect(taker.task('test1')).to.equal(fn);
    done();
  });

  it('should register a named function by string name', function(done){
    taker.task('test1', noop);
    expect(taker.task('test1')).to.equal(noop);
    done();
  });

  it('should not get a task that was not registered', function(done){
    expect(taker.task('test1')).to.be.an('undefined');
    done();
  });

  it('should get a task that was registered', function(done){
    taker.task('test1', noop);
    expect(taker.task('test1')).to.equal(noop);
    done();
  });

  it('should return a function that was registered in some other way', function(done){
    taker.registry.tasks.test1 = noop;
    expect(taker.task('test1')).to.equal(noop);
    done();
  });
});
