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

describe('lastRun', function(){

  var taker;

  beforeEach(function(done){
    taker = new Undertaker();
    taker.task('test1', fn);
    taker.task('test2', fn);
    done();
  });

  it('should record tasks time execution', function(done){
    var since = Date.now();
    taker.parallel('test1')(function(err, results){
      expect(taker.lastRun('test1')).to.exist();
      expect(taker.lastRun('test1')).to.be.within(since, Date.now());
      expect(taker.lastRun('test2')).to.not.exist();
      expect(taker.lastRun('notexists')).to.not.exist();
      done(err);
    });
  });

  it('should record all tasks time execution', function(done){
    var since = Date.now();
    taker.parallel('test1', 'test2')(function(err, results){
      expect(taker.lastRun('test1')).to.exist();
      expect(taker.lastRun('test1')).to.be.within(since, Date.now());
      expect(taker.lastRun('test2')).to.exist();
      expect(taker.lastRun('test2')).to.be.within(since, Date.now());
      done(err);
    });
  });
});
