'use strict';

var lab = exports.lab = require('lab').script();
var expect = require('code').expect;

var describe = lab.describe;
var it = lab.it;
var beforeEach = lab.beforeEach;

var fs = require('fs');
var path = require('path');
var vinyl = require('vinyl-fs');
var jshint = require('gulp-jshint');
var spawn = require('child_process').spawn;
var once = require('once');
var aOnce = require('async-once');
var del = require('del');
var through = require('through2');

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

  it('should run dependencies once', function(done) {
    var count = 0;

    taker.task('clean', once(function() {
      count++;
      return del(['./fixtures/some-build.txt'], {cwd: __dirname});
    }));

    taker.task('build-this', taker.series('clean', function(cb){
      cb();
    }));
    taker.task('build-that', taker.series('clean', function(cb){
      cb();
    }));
    taker.task('build', taker.series(
      'clean',
      taker.parallel(['build-this', 'build-that'])
    ));

    taker.parallel('build')(function(err){
      expect(count).to.equal(1);
      done(err);
    });
  });

  it('should run dependencies once', function(done) {
    var count = 0;

    taker.task('clean', aOnce(function(cb) {
      cb();
      count++;
      del(['./fixtures/some-build.txt'], {cwd: __dirname}, cb);
    }));

    taker.task('build-this', taker.series('clean', function(cb){
      cb();
    }));
    taker.task('build-that', taker.series('clean', function(cb){
      cb();
    }));
    taker.task('build', taker.series(
      'clean',
      taker.parallel(['build-this', 'build-that'])
    ));

    taker.parallel('build')(function(err){
      expect(count).to.equal(1);
      done(err);
    });
  });

  it('can use lastRun with vinyl.src `since` option', function(done) {
    var count = 0;

    function setup() {
      return vinyl.src('./fixtures/test*.js', {cwd: __dirname})
        .pipe(vinyl.dest('./fixtures/tmp', {cwd: __dirname}));
    }

    // some built
    taker.task('build', function() {
      return vinyl.src('./fixtures/tmp/*.js', {cwd: __dirname})
        .pipe(vinyl.dest('./fixtures/out', {cwd: __dirname}));
    });

    function userWait(cd) {
      setTimeout(cd, 1100);
    }

    function userEdit(cb) {
      fs.appendFile(path.join(__dirname, './fixtures/tmp/testMore.js'), ' ', cb);
    }

    function countEditedFiles() {
      return vinyl.src('./fixtures/tmp/*.js', {cwd: __dirname, since: taker.lastRun('build')})
        .pipe(through.obj(function(file, enc, cb) {
          count++;
          cb();
        }));
    }

    taker.series(setup, 'build', userWait, userEdit, countEditedFiles, function(cb) {
      expect(count).to.be.equal(1);
      cb();
    })(done);
  });
});
