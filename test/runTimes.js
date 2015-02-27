'use strict';

var lab = exports.lab = require('lab').script();
var expect = require('code').expect;

var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var beforeEach = lab.beforeEach;
var after = lab.after;
var afterEach = lab.afterEach;

var Undertaker = require('../');

function fn(done){
  done();
}

describe('parallel', function(){

  var taker;

  beforeEach(function(done){
    taker = new Undertaker();
    taker.task('test1', fn);
    taker.task('test2', fn);
    done();
  });

  it('should record tasks time execution', function(done){
    taker.parallel('test1')(function(err, results){
      expect(taker._last_runs.test1).to.not.be.undefined();
      expect(taker._last_runs.test1.time).to.not.be.undefined();
      expect(taker._last_runs.test2).to.be.undefined();
      done(err);
    });
  });

  it('should record all tasks time execution', function(done){
    taker.parallel('test1', 'test2')(function(err, results){
      expect(taker._last_runs.test1).to.not.be.undefined();
      expect(taker._last_runs.test2).to.not.be.undefined();
      done(err);
    });
  });
});
