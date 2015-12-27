'use strict';

var lab = exports.lab = require('lab').script();
var expect = require('code').expect;

var describe = lab.describe;
var it = lab.it;
var beforeEach = lab.beforeEach;

var Undertaker = require('../');

function noop(done) {
  done();
}

var anon = function() {};

describe('task', function() {
  var taker;

  beforeEach(function(done) {
    taker = new Undertaker();
    done();
  });

  it('should register a named function', function(done) {
    expect(taker.task('noop')).to.be.undefined();
    expect(taker.task(noop)).to.be.undefined();
    expect(taker.task('noop')).to.equal(noop);
    done();
  });

  it('should register an anonymous function by string name', function(done) {
    expect(taker.task('test1')).to.be.undefined();
    expect(taker.task('test1', anon)).to.be.undefined();
    expect(taker.task('test1')).to.equal(anon);
    done();
  });

  it('should register an anonymous function by displayName property', function(done) {
    anon.displayName = '<display name>';

    taker.task(anon);

    var task0 = taker.task('<display name>');
    expect(task0).to.equal(anon);
    expect(task0.displayName).to.equal('<display name>');

    delete anon.displayName;
    done();
  });

  it('should throw on register an anonymous function without string name', function(done) {
    function noName() {
      taker.task(anon);
    }

    expect(noName).to.throw(Error, 'Task name must be specified');
    done();
  });

  it('should register a named function by string name', function(done) {
    expect(taker.task('test1', noop)).to.be.undefined();
    expect(taker.task('test1')).to.equal(noop);
    done();
  });

  it('should not get a task that was not registered', function(done) {
    expect(taker.task('test1')).to.be.undefined();
    done();
  });

  it('should get a task that was registered', function(done) {
    expect(taker.task('test1', noop)).to.be.undefined();
    expect(taker.task('test1')).to.equal(noop);
    expect(taker.task('test1')).to.equal(noop);
    expect(taker.task('test1')).to.equal(noop);
    done();
  });

  it('should return a function that was registered in some other way', function(done) {
    taker.task('test1', noop);
    expect(taker._getTask('test1')).to.equal(noop);
    expect(taker.task('test1')).to.equal(noop);
    expect(taker.registry()._tasks.test1, noop);
    done();
  });

  it('should prefer displayName instead of name when both properties are defined', function(done) {
    function fn() {}
    fn.displayName = 'test1';
    taker.task(fn);
    expect(taker.task('test1')).to.equal(fn);
    done();
  });

  it('should allow different tasks to refer to the same function', function(done) {
    function fn() {}
    taker.task('foo', fn);
    taker.task('bar', fn);
    expect(taker.task('foo')).to.equal(taker.task('bar'));
    done();
  });

  it('should allow using aliased tasks in composite tasks', function(done) {
    var count = 0;
    function fn(cb) {
      count++;
      cb();
    }

    taker.task('foo', fn);
    taker.task('bar', fn);

    taker.series('foo', 'bar', function(cb) {
      expect(count).to.equal(2);
      cb();
    });

    taker.parallel('foo', 'bar', function(cb) {
      setTimeout(function() {
        expect(count).to.equal(4);
        cb();
      }, 500);
    });

    done();
  });

  it('should allow composite tasks tasks to be aliased', function(done) {
    var count = 0;
    function fn1(cb) {
      count += 1;
      cb();
    }
    function fn2(cb) {
      count += 2;
      cb();
    }

    taker.task('ser', taker.series(fn1, fn2));
    taker.task('foo', taker.task('ser'));

    taker.task('par', taker.parallel(fn1, fn2));
    taker.task('bar', taker.task('par'));

    taker.series('foo', function(cb) {
      expect(count).to.equal(3);
      cb();
    });

    taker.series('bar', function(cb) {
      setTimeout(function() {
        expect(count).to.equal(6);
        cb();
      }, 500);

    });

    done();
  });

  it('use fn.description as a task description', function(done) {
    function fn() {}
    fn.description = 'Task #0.';
    taker.task('task-0', fn);
    var task0 = taker.task('task-0');
    expect(task0).to.equal(fn);
    expect(task0.description).to.equal('Task #0.');
    done();
  });

  it('use fn.flag as a task options', function(done) {
    function fn() {}
    fn.flag = {
      '--option1': 'Option 1.',
      '--option2': 'Option 2.',
    };
    taker.task('task-0', fn);
    var task0 = taker.task('task-0');
    expect(task0).to.equal(fn);
    expect(task0.flag['--option1']).to.equal('Option 1.');
    expect(task0.flag['--option2']).to.equal('Option 2.');
    done();
  });

  it('take over a description and a flag between tasks', function(done) {
    function fn() {}
    fn.description = 'Task #0.';
    fn.flag = {
      '--option1': 'Option 1.',
      '--option2': 'Option 2.',
    };

    taker.task('task-0', fn);
    var task0 = taker.task('task-0');
    expect(task0).to.equal(fn);
    expect(task0.description).to.equal('Task #0.');
    expect(task0.flag['--option1']).to.equal('Option 1.');
    expect(task0.flag['--option2']).to.equal('Option 2.');

    taker.task('task-1', taker.task('task-0'));
    var task1 = taker.task('task-1');
    expect(task1).to.equal(fn);
    expect(task1.description).to.equal('Task #0.');
    expect(task1.flag['--option1']).to.equal('Option 1.');
    expect(task1.flag['--option2']).to.equal('Option 2.');

    taker.task(fn);
    var task2 = taker.task('fn');
    expect(task2).to.equal(fn);
    expect(task1.description).to.equal('Task #0.');
    expect(task1.flag['--option1']).to.equal('Option 1.');
    expect(task1.flag['--option2']).to.equal('Option 2.');

    fn.displayName = 'task-2';
    taker.task(fn);
    var task2 = taker.task('task-2');
    expect(task2).to.equal(fn);
    expect(task1.description).to.equal('Task #0.');
    expect(task1.flag['--option1']).to.equal('Option 1.');
    expect(task1.flag['--option2']).to.equal('Option 2.');

    done();
  });
});
