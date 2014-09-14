'use strict';

var lab = exports.lab = require('lab').script();
var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var beforeEach = lab.beforeEach;
var after = lab.after;
var afterEach = lab.afterEach;
var expect = require('lab').expect;

var Undertaker = require('../');

var simple = require('./fixtures/taskTree/simple');
var singleLevel = require('./fixtures/taskTree/singleLevel');
var doubleLevel = require('./fixtures/taskTree/doubleLevel');
var tripleLevel = require('./fixtures/taskTree/tripleLevel');

function noop(done){ done(); }

describe('tree', function(){

  var taker;

  beforeEach(function(done){
    taker = new Undertaker();
    done();
  });

  it('should return a simple tree by default', function(done){
    taker.task('test1', noop);
    taker.task('test2', noop);
    taker.task('test3', noop);
    taker.task('error', noop);

    var ser = taker.series('test1', 'test2');
    var anon = function(done){
      done();
    };

    taker.task('ser', taker.series('test1', 'test2'));
    taker.task('par', taker.parallel('test1', 'test2', 'test3'));
    taker.task('serpar', taker.series('ser', 'par'));
    taker.task('serpar2', taker.series(ser, anon));

    var tree = taker.tree();

    expect(tree).to.deep.equal(simple);
    done();
  });

  it('should form a 1 level tree', function(done){
    taker.task('fn1', noop);
    taker.task('fn2', noop);

    var tree = taker.tree({ deep: true });

    expect(tree).to.deep.equal(singleLevel);
    done();
  });

  it('should form a 2 level nested tree', function(done){
    taker.task('fn1', noop);
    taker.task('fn2', noop);
    taker.task('fn3', taker.series('fn1', 'fn2'));

    var tree = taker.tree({ deep: true });

    expect(tree).to.deep.equal(doubleLevel);
    done();
  });

  it('should form a 3 level nested tree', function(done){
    var anon = function(done){
      done();
    };
    taker.task('fn1', taker.parallel(anon, noop));
    taker.task('fn2', taker.parallel(anon, noop));
    taker.task('fn3', taker.series('fn1', 'fn2'));

    var tree = taker.tree({ deep: true });

    expect(tree).to.deep.equal(tripleLevel);
    done();
  });

});
