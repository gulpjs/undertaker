'use strict';

var lab = exports.lab = require('lab').script();
var expect = require('code').expect;

var describe = lab.describe;
var it = lab.it;
var beforeEach = lab.beforeEach;

var Undertaker = require('../');

function noop(done){ done(); }

describe('get', function(){

  var taker;

  beforeEach(function(done){
    taker = new Undertaker();
    done();
  });

  it('should not get a task that was not registered', function(done){
    expect(taker.task('test1')).to.be.undefined();
    done();
  });

  it('should get a task that was registered', function(done){
    taker.task('test1', noop);
    expect(taker.task('test1')).to.equal(noop);
    done();
  });

  it('should return a function that was registered in some other way', function(done){
    taker.registry()._tasks.test1 = noop;
    expect(taker.task('test1')).to.equal(noop);
    done();
  });
});
