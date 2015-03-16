'use strict';

var lab = exports.lab = require('lab').script();
var expect = require('code').expect;

var describe = lab.describe;
var it = lab.it;
var beforeEach = lab.beforeEach;

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
    taker.parallel('test1')(function(err){
      expect(taker.lastRun('test1')).to.exist();
      expect(taker.lastRun('test1')).to.be.within(since, Date.now());
      expect(taker.lastRun('test2')).to.not.exist();
      expect(taker.lastRun('notexists')).to.not.exist();
      done(err);
    });
  });

  it('should record all tasks time execution', function(done){
    var since = Date.now();
    taker.parallel('test1', 'test2')(function(err){
      expect(taker.lastRun('test1')).to.exist();
      expect(taker.lastRun('test1')).to.be.within(since, Date.now());
      expect(taker.lastRun('test2')).to.exist();
      expect(taker.lastRun('test2')).to.be.within(since, Date.now());
      done(err);
    });
  });

  it('should record task start time', function(done){
    var since = Date.now();

    taker.emit('start', {uid: 1, name: 'test1', time: since});
    taker.emit('stop', {uid: 1, name: 'test1', time: since + 1});

    expect(taker.lastRun('test1')).to.be.equal(since);
    done();
  });

  it('should not record task start time on error', function(done){
    var since = Date.now();

    taker.emit('start', {uid: 1, name: 'test1', time: since});
    taker.emit('error', {uid: 1, name: 'test1'});

    expect(taker.lastRun('test1')).to.not.exist();
    done();
  });

  it('should keep last record task start time on error', function(done){
    var since = Date.now();

    taker.emit('start', {uid: 1, name: 'test1', time: since});
    taker.emit('stop', {uid: 1, name: 'test1', time: since + 1});
    taker.emit('start', {uid: 1, name: 'test1', time: since + 2});
    taker.emit('error', {uid: 1, name: 'test1'});

    expect(taker.lastRun('test1')).to.be.equal(since);
    done();
  });

  it('should record last task start time on concurrent run', function(done){
    var since = Date.now();

    taker.emit('start', {uid: 1, name: 'test1', time: since - 1});
    taker.emit('start', {uid: 2, name: 'test1', time: since});
    taker.emit('stop', {uid: 2, name: 'test1', time: since + 1});
    taker.emit('stop', {uid: 1, name: 'test1', time: since + 2});

    expect(taker.lastRun('test1')).to.be.equal(since);
    done();
  });

  it('should record last task start time on concurrent run with error', function(done){
    var since = Date.now();

    taker.emit('start', {uid: 1, name: 'test1', time: since - 1});
    taker.emit('start', {uid: 2, name: 'test1', time: since});
    taker.emit('stop', {uid: 2, name: 'test1', time: since + 1});
    taker.emit('error', {uid: 1, name: 'test1'});

    expect(taker.lastRun('test1')).to.be.equal(since);
    done();
  });

  it('should record last task start time on concurrent run with error first', function(done){
    var since = Date.now();

    taker.emit('start', {uid: 1, name: 'test1', time: since - 1});
    taker.emit('start', {uid: 2, name: 'test1', time: since});
    taker.emit('error', {uid: 1, name: 'test1'});
    taker.emit('stop', {uid: 2, name: 'test1', time: since + 1});

    expect(taker.lastRun('test1')).to.be.equal(since);
    done();
  });

  it('keep last record task start time on unexpected error', function(done){
    var since = Date.now();

    // stop event without any start event
    taker.emit('stop', {uid: 1, name: 'test1', time: since - 4});
    expect(taker.lastRun('test1')).to.not.exist();

    // error event without any start event
    taker.emit('error', {uid: 2, name: 'test1', time: since - 3});
    expect(taker.lastRun('test1')).to.not.exist();

    // Start event without start time
    taker.emit('start', {uid: 3, name: 'test1'});
    taker.emit('stop', {uid: 3, name: 'test1', time: since - 1});
    expect(taker.lastRun('test1')).to.not.exist();

    taker.emit('start', {uid: 4, name: 'test1', time: since});
    taker.emit('stop', {uid: 4, name: 'test1', time: since + 1});
    expect(taker.lastRun('test1')).to.be.equal(since);

    // stop event without matching start event
    taker.emit('stop', {uid: 5, name: 'test1', time: since + 2});
    expect(taker.lastRun('test1')).to.be.equal(since);

    done();
  });
});
