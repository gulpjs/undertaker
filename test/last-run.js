'use strict';

var lab = exports.lab = require('lab').script();
var expect = require('code').expect;

var describe = lab.describe;
var it = lab.it;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;

var Undertaker = require('../');

describe('lastRun', function() {
  var taker;
  var defaultResolution = process.env.UNDERTAKER_TIME_RESOLUTION;
  var test1;
  var test2;
  var error;

  beforeEach(function(done) {
    process.env.UNDERTAKER_TIME_RESOLUTION = '0';
    taker = new Undertaker();

    test1 = function(cb){ cb(); };
    taker.task('test1', test1);

    test2 = function(cb){ cb(); };
    test2.displayName = 'test2';
    taker.task(test2);

    error = function(cb){ cb(new Error()); };
    taker.task('error', error);

    done();
  });

  afterEach(function(done) {
    process.env.UNDERTAKER_TIME_RESOLUTION = defaultResolution;
    done();
  });

  it('should record tasks time execution', function(done) {
    var since = Date.now();
    taker.parallel('test1')(function(err) {
      expect(taker.lastRun('test1')).to.exist();
      expect(taker.lastRun('test1')).to.be.within(since, Date.now());
      expect(taker.lastRun(test2)).to.not.exist();
      expect(taker.lastRun(function(){})).to.not.exist();
      expect(taker.lastRun.bind(taker, 'notexists')).to.throw(Error);
      done(err);
    });
  });

  it('should record all tasks time execution', function(done){
    var since = Date.now();
    taker.parallel('test1', test2)(function(err){
      expect(taker.lastRun('test1')).to.exist();
      expect(taker.lastRun('test1')).to.be.within(since, Date.now());
      expect(taker.lastRun(test2)).to.exist();
      expect(taker.lastRun(test2)).to.be.within(since, Date.now());
      done(err);
    });
  });

  it('should record same tasks time execution for a string task and its original', function(done){
    taker.series(test2)(function(err){
      expect(taker.lastRun(test2)).to.equal(taker.lastRun('test2'));
      done(err);
    });
  });

  it('should give time with 1s resolution', function(done){
    var resolution = 1000; // 1s
    var since = Date.now();
    var expected = since - (since % resolution);

    taker.series('test1')(function(){
      expect(taker.lastRun('test1', resolution)).to.equal(expected);
      done();
    });
  });

  it('should not record task start time on error', function(done){
    taker.on('error', function(){
      // to keep the test from catching the emitted errors
    });
    taker.series('error')(function(err){
      expect(err).to.exist();
      expect(taker.lastRun('error')).to.not.exist();
      done();
    });
  });

});
