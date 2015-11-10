'use strict';

var lab = exports.lab = require('lab').script();
var expect = require('code').expect;

var describe = lab.describe;
var it = lab.it;
var beforeEach = lab.beforeEach;

var Undertaker = require('../');

var simple = require('./fixtures/taskTree/simple');
var singleLevel = require('./fixtures/taskTree/singleLevel');
var doubleLevel = require('./fixtures/taskTree/doubleLevel');
var tripleLevel = require('./fixtures/taskTree/tripleLevel');
var aliasSimple = require('./fixtures/taskTree/aliasSimple');
var aliasNested = require('./fixtures/taskTree/aliasNested');

function noop(done){ done(); }

describe('tree', function(){

  var taker;

  beforeEach(function(done){
    taker = new Undertaker();
    done();
  });

  it('should return a simple tree by default', function(done){
    taker.task('test1', function(cb){ cb(); });
    taker.task('test2', function(cb){ cb(); });
    taker.task('test3', function(cb){ cb(); });
    taker.task('error', function(cb){ cb(); });

    var ser = taker.series('test1', 'test2');
    var anon = function(cb){
      cb();
    };
    anon.displayName = '<display name>';

    taker.task('ser', taker.series('test1', 'test2'));
    taker.task('par', taker.parallel('test1', 'test2', 'test3'));
    taker.task('serpar', taker.series('ser', 'par'));
    taker.task('serpar2', taker.series(ser, anon));
    taker.task(anon);

    var tree = taker.tree();

    expect(tree).to.deep.equal(simple);
    done();
  });

  it('should form a 1 level tree', function(done){
    taker.task('fn1', function(cb){ cb(); });
    taker.task('fn2', function(cb){ cb(); });

    var tree = taker.tree({ deep: true });

    expect(tree).to.deep.equal(singleLevel);
    done();
  });

  it('should form a 2 level nested tree', function(done){
    taker.task('fn1', function(cb){ cb(); });
    taker.task('fn2', function(cb){ cb(); });
    taker.task('fn3', taker.series('fn1', 'fn2'));

    var tree = taker.tree({ deep: true });

    expect(tree).to.deep.equal(doubleLevel);
    done();
  });

  it('should form a 3 level nested tree', function(done){
    var anon = function(cb){
      cb();
    };
    taker.task('fn1', taker.parallel(anon, noop));
    taker.task('fn2', taker.parallel(anon, noop));
    taker.task('fn3', taker.series('fn1', 'fn2'));

    var tree = taker.tree({ deep: true });

    expect(tree).to.deep.equal(tripleLevel);
    done();
  });

  it('should use the proper labels for aliased tasks (simple)', function(done) {
    var anon = function(cb) {
      cb();
    };
    taker.task(noop);
    taker.task('fn1', noop);
    taker.task('fn2', taker.task('noop'));
    taker.task('fn3', anon);
    taker.task('fn4', taker.task('fn3'));

    var tree = taker.tree({ deep: true });

    expect(tree).to.deep.equal(aliasSimple);
    done();
  });

  it('should use the proper labels for aliased tasks (nested)', function(done) {
    var anon = function(cb) {
      cb();
    };
    taker.task(noop);
    taker.task('fn1', noop);
    taker.task('fn2', taker.task('noop'));
    taker.task('fn3', anon);
    taker.task('ser', taker.series(noop, anon, 'fn1', 'fn2', 'fn3'));
    taker.task('par', taker.parallel(noop, anon, 'fn1', 'fn2', 'fn3'));

    var tree = taker.tree({ deep: true });

    expect(tree).to.deep.equal(aliasNested);
    done();
  });

});
