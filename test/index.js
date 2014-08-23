'use strict';

var lab = exports.lab = require('lab').script();
var expect = require('lab').expect;

var Undertaker = require('../');

function noop(done){ done(); }

lab.test('retrieving a task that was not registered', function(done){
  var taker = new Undertaker();
  expect(taker.task('test1')).to.be.an('undefined');
  done();
});

lab.test('retrieving a task that was registered', function(done){
  var taker = new Undertaker();
  taker.task('test1', noop);
  expect(taker.task('test1')).to.equal(noop);
  done();
});

lab.test('register a named function', function(done){
  var taker = new Undertaker();
  taker.task(noop);
  expect(taker.task('noop')).to.equal(noop);
  done();
});

lab.test('register an anonymous function by string', function(done){
  var taker = new Undertaker();
  taker.task('test1', noop);
  expect(taker.task('test1')).to.equal(noop);
  done();
});

lab.test('series', function(done){
  var taker = new Undertaker();
  taker.on('stop', function(evt){
    console.log(evt);
  });
  taker.task(noop);
  taker.series(taker.series('noop'))(done);
});
