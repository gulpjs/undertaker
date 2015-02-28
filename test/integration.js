'use strict';

var lab = exports.lab = require('lab').script();
var expect = require('code').expect;

var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var beforeEach = lab.beforeEach;
var after = lab.after;
var afterEach = lab.afterEach;

var vinyl = require('vinyl-fs');
var jshint = require('gulp-jshint');
var spawn = require('child_process').spawn;
var once = require('once');
var promisedDel = require('promised-del');

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
      return promisedDel(['./fixtures/some-build.txt'], {cwd: __dirname});
    }));

    taker.task('build-this', taker.series(['clean', function(done){done();}]));
    taker.task('build-that', taker.series(['clean', function(done){done();}]));
    taker.task('build', taker.series([
      'clean',
      taker.parallel(['build-this', 'build-that'])
    ]));

    taker.parallel('build')(function(err){
      expect(count).to.equal(1);
      done(err);
    });
  });
});
