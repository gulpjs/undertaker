'use strict';

var lab = exports.lab = require('lab').script();
var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var beforeEach = lab.beforeEach;
var after = lab.after;
var afterEach = lab.afterEach;
var expect = require('lab').expect;

var archy = require('archy');

var Undertaker = require('../');

function fn1(done){
  done(null, 1);
}

function fn2(done){
  setTimeout(function(){
    done(null, 2);
  }, 500);
}

function fn3(done){
  done(null, 3);
}

function fnError(done){
  done(new Error('An Error Occurred'));
}

describe('tree', function(){

  var taker;

  beforeEach(function(done){
    taker = new Undertaker();
    taker.task('test1', fn1);
    taker.task('test2', fn2);
    taker.task('test3', fn3);
    taker.task('error', fnError);

    var ser = taker.series('test1', 'test2');
    var anon = function(done){
      done();
    };

    taker.task('ser', taker.series('test1', 'test2'));
    taker.task('par', taker.parallel('test1', 'test2', 'test3'));
    taker.task('serpar', taker.series('ser', 'par'));
    taker.task('serpar2', taker.series(ser, anon));
    done();
  });

  it('should return a simple tree by default', function(done){
    var tree = taker.tree();
    expect(tree).to.deep.equal([
      'test1',
      'test2',
      'test3',
      'error',
      'ser',
      'par',
      'serpar',
      'serpar2'
    ]);
    done();
  });

  it('should return a deep tree if specified in options', function(done){
    var tree = taker.tree({ deep: true });
    // console.log(JSON.stringify(tree, null, 2));
    // console.log(archy({
    //   label: 'top',
    //   nodes: tree
    // }));
    done();
  });

});
