"use strict";

var assert = require("node:assert");
var { beforeEach, describe, it } = require("node:test");

var Undertaker = require("../");

function fn1(done) {
  done(null, 1);
}

function fn2(done) {
  setTimeout(function () {
    done(null, 2);
  }, 500);
}

function fn3(done) {
  done(null, 3);
}

function fnError(done) {
  done(new Error("An Error Occurred"));
}

describe("series", function () {
  var taker;

  beforeEach(function () {
    taker = new Undertaker();
    taker.task("test1", fn1);
    taker.task("test2", fn2);
    taker.task("test3", fn3);
    taker.task("error", fnError);
  });

  it("should throw on non-valid tasks combined with valid tasks", function () {
    function fail() {
      taker.series("test1", "test2", "test3", {});
    }

    assert.throws(fail, { message: /Task never defined:/ });
  });

  it("should throw on tasks array with both valid and non-valid tasks", function () {
    function fail() {
      taker.series(["test1", "test2", "test3", {}]);
    }

    assert.throws(fail, { message: /Task never defined:/ });
  });

  it("should throw on non-valid task", function () {
    function fail() {
      taker.series({});
    }

    assert.throws(fail, { message: /Task never defined:/ });
  });

  it("should throw when no tasks specified", function () {
    function fail() {
      taker.series();
    }

    assert.throws(fail, {
      message: /One or more tasks should be combined using series or parallel/,
    });
  });

  it("should throw on empty array of registered tasks", function () {
    function fail() {
      taker.series([]);
    }

    assert.throws(fail, {
      message: /One or more tasks should be combined using series or parallel/,
    });
  });

  it("should take only one array of registered tasks", function (t, done) {
    taker.series(["test1", "test2", "test3"])(function (err, results) {
      assert.deepStrictEqual(results, [1, 2, 3]);
      done(err);
    });
  });

  it("should take all string names", function (t, done) {
    taker.series(
      "test1",
      "test2",
      "test3",
    )(function (err, results) {
      assert.deepStrictEqual(results, [1, 2, 3]);
      done(err);
    });
  });

  it("should take all functions", function (t, done) {
    taker.series(
      fn1,
      fn2,
      fn3,
    )(function (err, results) {
      assert.deepStrictEqual(results, [1, 2, 3]);
      done(err);
    });
  });

  it("should take string names and functions", function (t, done) {
    taker.series(
      "test1",
      fn2,
      "test3",
    )(function (err, results) {
      assert.deepStrictEqual(results, [1, 2, 3]);
      done(err);
    });
  });

  it("should take nested series", function (t, done) {
    var series1 = taker.series("test1", "test2", "test3");
    taker.series(
      "test1",
      series1,
      "test3",
    )(function (err, results) {
      assert.deepStrictEqual(results, [1, [1, 2, 3], 3]);
      done(err);
    });
  });

  it("should stop processing on error", function (t, done) {
    taker.on("error", function () {
      // To keep the test from catching the emitted errors
    });
    taker.series(
      "test1",
      "error",
      "test3",
    )(function (err, results) {
      assert.ok(err instanceof Error);
      assert.deepStrictEqual(results, [1, undefined, undefined]);
      done();
    });
  });

  it("should throw on unregistered task", function () {
    function unregistered() {
      taker.series("unregistered");
    }

    assert.throws(unregistered, {
      message: "Task never defined: unregistered",
    });
  });

  it("should process all functions if settle flag is true", function (t, done) {
    taker.on("error", function () {
      // To keep the test from catching the emitted errors
    });
    taker._settle = true;
    taker.series(
      taker.series("test1", "error"),
      "test3",
    )(function (err, results) {
      assert.ok(err[0][0] instanceof Error);
      assert.deepStrictEqual(results, [3]);
      done();
    });
  });

  it("should not register a displayName on the returned function by default", function () {
    var task = taker.series(fn1);
    assert.strictEqual(task.displayName, undefined);
  });
});
