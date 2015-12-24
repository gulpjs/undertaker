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
    var task0 = taker.task('noop');
    expect(task0).to.be.undefined();

    var task1 = taker.task(noop);
    expect(task1).to.exist();
    expect(task1).function();

    var task2 = taker.task('noop');
    expect(task2).to.equal(task1);
    done();
  });

  it('should register an anonymous function by string name', function(done) {
    var task1 = taker.task('test1', anon);
    expect(task1).to.exist();
    expect(task1).function();

    var task2 = taker.task('test1');
    expect(task2).to.equal(task1);
    done();
  });

  it('should register an anonymous function by displayName property', function(done) {
    anon.displayName = '<display name>';

    var task1 = taker.task(anon);
    expect(task1).to.exist();
    expect(task1).function();

    expect(taker.task('<display name>')).to.equal(task1);
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
    var task1 = taker.task('test1', noop);
    expect(task1).to.exist();
    expect(task1).function();

    expect(taker.task('test1')).to.equal(task1);
    done();
  });

  it('should not get a task that was not registered', function(done) {
    expect(taker.task('test1')).to.be.undefined();
    done();
  });

  it('should get a task that was registered', function(done) {
    var task1 = taker.task('test1', noop);
    expect(task1).to.exist();
    expect(task1).function();

    expect(taker.task('test1')).to.equal(task1);
    done();
  });

  it('should return a function that was registered in some other way', function(done) {
    var task1 = taker.task('test1', noop);
    expect(taker._getTask('test1')).to.equal(noop);
    expect(taker.task('test1')).to.not.equal(noop);
    done();
  });

  it('should prefer displayName instead of name when both properties are defined', function(done) {
    function fn() {}
    fn.displayName = 'test1';
    var task1 = taker.task(fn);
    expect(taker.task('test1')).to.equal(task1);
    done();
  });

  it('should allow different tasks to refer to the same function', function(done) {
    function fn() {}
    var foo = taker.task('foo', fn);
    var bar = taker.task('bar', fn);
    expect(taker.task('foo')).to.equal(foo);
    expect(taker.task('bar')).to.equal(bar);
    expect(foo).to.not.equal(bar);
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

  it('attach task description to task', function(done) {
    taker.task('task-0', noop).description = 'Task #0.';
    var task0 = taker.task('task-0');
    expect(task0.description).to.equal('Task #0.');
    done();
  });

  it('attack task description with an object', function(done) {
    taker.task('task-0', noop).description = {
      '': 'Task #0.',
      '--option1': 'Option 1.',
      '--option2': 'Option 2.',
    };
    var task0 = taker.task('task-0');
    expect(task0.description['']).to.equal('Task #0.');
    expect(task0.description['--option1']).to.equal('Option 1.');
    expect(task0.description['--option2']).to.equal('Option 2.');
    done();
  });

  it('attack task description from function property', function(done) {
    var fn = function() {};
    fn.description = 'A Function';
    var task0 = taker.task('task-0', fn);
    expect(task0.description).to.equal('A Function');
    done();
  });

  it('Use a description with task#description rather than function#description', function(done) {
    var fn = function() {};
    fn.description = 'A Function';
    taker.task('task-0', fn).description = 'Task #0';
    var task0 = taker.task('task-0');
    expect(task0.description).to.equal('Task #0');
    done();
  });
});
