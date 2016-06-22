'use strict';

var lab = exports.lab = require('lab').script();
var expect = require('code').expect;

var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var beforeEach = lab.beforeEach;
var after = lab.after;
var afterEach = lab.afterEach;

var Undertaker = require('../');

var MetadataRegistry = require('undertaker-task-metadata');
var metadata = require('../lib/helpers/metadata');

function noop(done){ done(); }

describe('set', function(){

  var taker;

  beforeEach(function(done){
    taker = new Undertaker();
    done();
  });

  it('should register a function by string name', function(done){
    taker.set('test1', noop);
    expect(taker.get('test1')).to.equal(noop);
    done();
  });

  it('should attach metadata based on the return value of _registry.set', function(done){
    taker.registry(new MetadataRegistry());
    taker.set('test1', noop);
    var meta = metadata.get(taker._registry._tasks.test1);
    expect(meta).to.exist();
    expect(meta.name).to.equal('test1');
    done();
  });

  it('should throw on register with no name', function(done){
    function noName(){
      taker.set(null, noop);
    }

    expect(noName).to.throw(Error, 'Task name must be specified');
    done();
  });

  it('should throw on register with non-string name', function(done){
    function noString(){
      taker.set({}, noop);
    }

    expect(noString).to.throw(Error, 'Task name must be a string');
    done();
  });

  it('should throw on register with no function', function(done){
    function noFunction(){
      taker.set('test1');
    }

    expect(noFunction).to.throw(Error, 'Task function must be specified');
    done();
  });
});
