'use strict';

var lab = exports.lab = require('lab').script();
var expect = require('code').expect;

var describe = lab.describe;
var it = lab.it;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;

var Undertaker = require('../');
var lastRunLib = require('../lib/last-run');
var metadata = require('../lib/helpers/metadata');


describe('lastRun', function() {
  var taker, defaultResolution = process.env.UNDERTAKER_TIME_RESOLUTION, test1, test2, test1Id;

  beforeEach(function(done) {
    process.env.UNDERTAKER_TIME_RESOLUTION = '0';
    taker = new Undertaker();

    test1 = function(cb) { cb(); };
    taker.task('test1', test1);
    test1Id = metadata.getTaskId(test1);

    test2 = function(cb) { cb(); };
    test2.displayName = 'test2';
    taker.task(test2);

    done();
  });

  afterEach(function(done) {
    process.env.UNDERTAKER_TIME_RESOLUTION = defaultResolution;
    done();
  });

  describe('defaultResolution', function() {
    var major = lastRunLib.nodeVersion.major;
    var minor = lastRunLib.nodeVersion.minor;

    afterEach(function(done) {
      lastRunLib.nodeVersion.major = major;
      lastRunLib.nodeVersion.minor = minor;
      done();
    });

    it('should set default resolution to 1000 on node v0.10', function(done) {
      lastRunLib.nodeVersion.major = 0;
      lastRunLib.nodeVersion.minor = 10;
      expect(lastRunLib.defaultResolution()).to.equal(1000);
      done();
    });

    it('should set default resolution to 0 on node v0.11', function(done) {
      lastRunLib.nodeVersion.major = 0;
      lastRunLib.nodeVersion.minor = 11;
      expect(lastRunLib.defaultResolution()).to.equal(0);
      done();
    });

    it('should set default resolution to 0 on iojs v1.5', function(done) {
      lastRunLib.nodeVersion.major = 1;
      lastRunLib.nodeVersion.minor = 1;
      expect(lastRunLib.defaultResolution()).to.equal(0);
      done();
    });

    it('should set default resolution to UNDERTAKER_TIME_RESOLUTION', function(done) {
      process.env.UNDERTAKER_TIME_RESOLUTION = '2000';
      expect(lastRunLib.defaultResolution()).to.equal(2000);
      done();
    });

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

  it('should record task start time', function(done){
    var since = Date.now();

    taker.emit('start', {uid: 1, taskId: test1Id, name: 'test1', time: since});
    taker.emit('stop', {uid: 1, taskId: test1Id, name: 'test1', time: since + 1});

    expect(taker.lastRun('test1')).to.equal(since);
    done();
  });

  it('should give time with 1s resolution', function(done){
    var since = 1426000000111;
    var expected = 1426000000000;

    taker._registry.get('test1')._uid = 0;
    taker.emit('start', {uid: 1, taskId: test1Id, name: 'test1', time: since});
    taker.emit('stop', {uid: 1, taskId: test1Id, name: 'test1', time: since + 1});

    expect(taker.lastRun('test1', 1000)).to.equal(expected);
    done();
  });

  it('should not record task start time on error', function(done){
    var since = Date.now();

    taker._registry.get('test1')._uid = 0;
    taker.emit('start', {uid: 1, taskId: test1Id, name: 'test1', time: since});
    taker.emit('error', {uid: 1, taskId: test1Id, name: 'test1'});

    expect(taker.lastRun('test1')).to.not.exist();
    done();
  });

  it('should keep last record task start time on error', function(done){
    var since = Date.now();

    taker._registry.get('test1')._uid = 0;
    taker.emit('start', {uid: 1, taskId: test1Id, name: 'test1', time: since});
    taker.emit('stop', {uid: 1, taskId: test1Id, name: 'test1', time: since + 1});
    taker.emit('start', {uid: 1, taskId: test1Id, name: 'test1', time: since + 2});
    taker.emit('error', {uid: 1, taskId: test1Id, name: 'test1'});

    expect(taker.lastRun('test1')).to.equal(since);
    done();
  });

  it('should record last task start time on concurrent run', function(done){
    var since = Date.now();

    taker._registry.get('test1')._uid = 0;
    taker.emit('start', {uid: 1, taskId: test1Id, name: 'test1', time: since - 1});
    taker.emit('start', {uid: 2, taskId: test1Id, name: 'test1', time: since});
    taker.emit('stop', {uid: 2, taskId: test1Id, name: 'test1', time: since + 1});
    taker.emit('stop', {uid: 1, taskId: test1Id, name: 'test1', time: since + 2});

    expect(taker.lastRun('test1')).to.equal(since);
    done();
  });

  it('should record last task start time on concurrent run with error', function(done){
    var since = Date.now();

    taker._registry.get('test1')._uid = 0;
    taker.emit('start', {uid: 1, taskId: test1Id, name: 'test1', time: since - 1});
    taker.emit('start', {uid: 2, taskId: test1Id, name: 'test1', time: since});
    taker.emit('stop', {uid: 2, taskId: test1Id, name: 'test1', time: since + 1});
    taker.emit('error', {uid: 1, taskId: test1Id, name: 'test1'});

    expect(taker.lastRun('test1')).to.equal(since);
    done();
  });

  it('should record last task start time on concurrent run with error first', function(done){
    var since = Date.now();

    taker._registry.get('test1')._uid = 0;
    taker.emit('start', {uid: 1, taskId: test1Id, name: 'test1', time: since - 1});
    taker.emit('start', {uid: 2, taskId: test1Id, name: 'test1', time: since});
    taker.emit('error', {uid: 1, taskId: test1Id, name: 'test1'});
    taker.emit('stop', {uid: 2, taskId: test1Id, name: 'test1', time: since + 1});

    expect(taker.lastRun('test1')).to.equal(since);
    done();
  });

  it('keep last record task start time on unexpected error', function(done){
    var since = Date.now();

    taker._registry.get('test1')._uid = 0;

    // stop event without any start event
    taker.emit('stop', {uid: 1, taskId: test1Id, name: 'test1', time: since - 4});
    expect(taker.lastRun('test1')).to.not.exist();

    // error event without any start event
    taker.emit('error', {uid: 2, taskId: test1Id, name: 'test1', time: since - 3});
    expect(taker.lastRun('test1')).to.not.exist();

    // Start event without start time
    taker.emit('start', {uid: 3, taskId: test1Id, name: 'test1'});
    taker.emit('stop', {uid: 3, taskId: test1Id, name: 'test1', time: since - 1});
    expect(taker.lastRun('test1')).to.not.exist();

    taker.emit('start', {uid: 4, taskId: test1Id, name: 'test1', time: since});
    taker.emit('stop', {uid: 4, taskId: test1Id, name: 'test1', time: since + 1});
    expect(taker.lastRun('test1')).to.equal(since);

    // stop event without matching start event
    taker.emit('stop', {uid: 5, taskId: test1Id, name: 'test1', time: since + 2});
    expect(taker.lastRun('test1')).to.equal(since);

    done();
  });
});
