"use strict";

var assert = require("node:assert");
var { afterEach, beforeEach, describe, it } = require("node:test");

var Undertaker = require("../");

describe("lastRun", function () {
  var taker, test1, test2, error, alias;
  var defaultResolution = process.env.UNDERTAKER_TIME_RESOLUTION;

  beforeEach(function () {
    process.env.UNDERTAKER_TIME_RESOLUTION = "0";
    taker = new Undertaker();

    test1 = function (cb) {
      cb();
    };
    taker.task("test1", test1);

    test2 = function (cb) {
      cb();
    };
    test2.displayName = "test2";
    taker.task(test2);

    error = function (cb) {
      cb(new Error());
    };
    taker.task("error", error);

    alias = test1;
    taker.task("alias", alias);
  });

  afterEach(function () {
    process.env.UNDERTAKER_TIME_RESOLUTION = defaultResolution;
  });

  it("should only record time when task has completed", function (t, done) {
    var ts;
    var test = function (cb) {
      ts = taker.lastRun("test");
      cb();
    };
    taker.task("test", test);
    taker.parallel("test")(function (err) {
      assert.strictEqual(ts, undefined);
      done(err);
    });
  });

  it("should record tasks time execution", function (t, done) {
    taker.parallel("test1")(function (err) {
      assert.ok(taker.lastRun("test1"));
      assert.strictEqual(taker.lastRun("test1") <= Date.now(), true);
      assert.strictEqual(taker.lastRun(test2), undefined);
      assert.strictEqual(
        taker.lastRun(function () {}),
        undefined,
      );
      assert.throws(() => taker.lastRun("notexists"), Error);
      done(err);
    });
  });

  it("should record all tasks time execution", function (t, done) {
    taker.parallel(
      "test1",
      test2,
    )(function (err) {
      assert.ok(taker.lastRun("test1"));
      assert.strictEqual(taker.lastRun("test1") <= Date.now(), true);
      assert.ok(taker.lastRun("test2"));
      assert.strictEqual(taker.lastRun("test2") <= Date.now(), true);
      done(err);
    });
  });

  it("should record same tasks time execution for a string task and its original", function (t, done) {
    taker.series(test2)(function (err) {
      assert.strictEqual(taker.lastRun(test2), taker.lastRun("test2"));
      done(err);
    });
  });

  it("should record tasks time execution for an aliased task", function (t, done) {
    taker.series("alias")(function (err) {
      assert.strictEqual(taker.lastRun("alias"), taker.lastRun("test1"));
      done(err);
    });
  });

  it("should give time with 1s resolution", function (t, done) {
    var resolution = 1000; // 1s
    var since = Date.now();
    var expected = since - (since % resolution);

    taker.series("test1")(function () {
      assert.strictEqual(taker.lastRun("test1", resolution), expected);
      done();
    });
  });

  it("should not record task start time on error", function (t, done) {
    taker.on("error", function () {
      // To keep the test from catching the emitted errors
    });
    taker.series("error")(function (err) {
      assert.ok(err instanceof Error);
      assert.strictEqual(taker.lastRun("error"), undefined);
      done();
    });
  });
});
