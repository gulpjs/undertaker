'use strict';

var lab = exports.lab = require('lab').script();
var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var beforeEach = lab.beforeEach;
var after = lab.after;
var afterEach = lab.afterEach;
var expect = require('lab').expect;
var vinyl = require('vinyl-fs');
var jshint = require('gulp-jshint');
var spawn = require('child_process').spawn;

var Undertaker = require('../');

describe('integrations', function() {

  var taker;

  beforeEach(function(done) {
    taker = new Undertaker();
    done();
  });

  it('should handle vinyl streams', function(done) {
    taker.task('test', function () {
      return vinyl.src('./fixtures/test.js', {cwd: __dirname})
        .pipe(vinyl.dest('./fixtures/out', {cwd: __dirname}));
    });

    taker.parallel('test')(done);
  });

  it('should exhaust vinyl streams', function(done) {
    taker.task('test', function () {
      return vinyl.src('./fixtures/test.js', {cwd: __dirname});
    });

    taker.parallel('test')(done);
  });

  it('should lints all piped files', function(done) {
    taker.task('test', function () {
      return vinyl.src('./fixtures/test.js', {cwd: __dirname})
        .pipe(jshint());
    });

    taker.parallel('test')(done);
  });

  it('should handle a child process return', function(done) {
    taker.task('test', function () {
      return spawn('ls', ['-lh', __dirname]);
    });

    taker.parallel('test')(done);
  });
});
