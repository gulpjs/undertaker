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
var foldedTasks = require('./fixtures/taskTree/foldedTasks');

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

  it('should form tripleLevela 2 level nested tree', function(done){
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

  it('should fold same tasks into array (shallow test)', function(done) {
    var sampleFunc = function(cb) {cb();};
    taker.task('fn1', sampleFunc);
    taker.task('fn2', sampleFunc);
    taker.task('fn3', function(cb) {cb();});
    taker.task('fn4', sampleFunc);

    var tree = taker.tree({ deep: false });
    expect(tree).to.deep.equal([['fn1', 'fn2', 'fn4'], 'fn3']);

    done();
  });

  it('should fold same tasks into array (deep test)', function(done) {
    var sampleFunc = function(cb) {cb();};
    taker.task('fn1', sampleFunc);
    taker.task('fn2', sampleFunc);
    taker.task('fn3', function(cb) {cb();});
    taker.task('fn4', sampleFunc);

    var tree = taker.tree({ deep: true });
    expect(tree).to.deep.equal(foldedTasks);
    done();
  });
});
