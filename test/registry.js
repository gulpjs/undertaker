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

var DefaultRegistry = require('undertaker-registry');

function CustomRegistry(){}

describe('registry', function(){

  it('should take a custom registry', function(done){
    var taker = new Undertaker(CustomRegistry);
    expect(taker.registry).to.be.an.instanceof(CustomRegistry);
    expect(taker.registry).to.not.be.an.instanceof(DefaultRegistry);
    done();
  });

  it('should default to undertaker-registry if not constructed with custom registry', function(done){
    var taker = new Undertaker();
    expect(taker.registry).to.be.an.instanceof(DefaultRegistry);
    expect(taker.registry).to.not.be.an.instanceof(CustomRegistry);
    done();
  });
});
