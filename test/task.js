"use strict";

var assert = require("node:assert");
var { beforeEach, describe, it } = require("node:test");

var Undertaker = require("../");

function noop(done) {
  done();
}

var anon = function () {};

describe("task", function () {
  var taker;

  beforeEach(function () {
    taker = new Undertaker();
  });

  it("should register a named function", function () {
    taker.task(noop);
    assert.strictEqual(taker.task("noop").unwrap(), noop);
  });

  it("should register an anonymous function by string name", function () {
    taker.task("test1", anon);
    assert.strictEqual(taker.task("test1").unwrap(), anon);
  });

  it("should register an anonymous function by displayName property", function () {
    anon.displayName = "<display name>";
    taker.task(anon);
    assert.strictEqual(taker.task("<display name>").unwrap(), anon);
    delete anon.displayName;
  });

  it("should throw on register an anonymous function without string name", function () {
    function noName() {
      taker.task(function () {});
    }

    assert.throws(noName, { message: "Task name must be specified" });
  });

  it("should register a named function by string name", function () {
    taker.task("test1", noop);
    assert.strictEqual(taker.task("test1").unwrap(), noop);
  });

  it("should not get a task that was not registered", function () {
    assert.strictEqual(taker.task("test1"), undefined);
  });

  it("should get a task that was registered", function () {
    taker.task("test1", noop);
    assert.strictEqual(taker.task("test1").unwrap(), noop);
  });

  it("should get the wrapped task, not original function", function () {
    var registry = taker.registry();
    taker.task("test1", noop);
    assert.strictEqual(typeof taker.task("test1").unwrap, "function");
    assert.strictEqual(taker.task("test1"), registry.get("test1"));
  });

  it("provides an `unwrap` method to get the original function", function () {
    taker.task("test1", noop);
    assert.strictEqual(typeof taker.task("test1").unwrap, "function");
    assert.strictEqual(taker.task("test1").unwrap(), noop);
  });

  it("should return a function that was registered in some other way", function () {
    taker.registry()._tasks.test1 = noop;
    assert.strictEqual(taker.task("test1"), noop);
  });

  it("should prefer displayName instead of name when both properties are defined", function () {
    function fn() {}
    fn.displayName = "test1";
    taker.task(fn);
    assert.strictEqual(taker.task("test1").unwrap(), fn);
  });

  it("should allow different tasks to refer to the same function", function () {
    function fn() {}
    taker.task("foo", fn);
    taker.task("bar", fn);
    assert.strictEqual(taker.task("foo").unwrap(), taker.task("bar").unwrap());
  });

  it("should allow using aliased tasks in composite tasks", function (t, done) {
    var count = 0;
    function fn(cb) {
      count++;
      cb();
    }

    taker.task("foo", fn);
    taker.task("bar", fn);

    var series = taker.series("foo", "bar", function (cb) {
      assert.strictEqual(count, 2);
      cb();
    });

    var parallel = taker.parallel("foo", "bar", function (cb) {
      setTimeout(function () {
        assert.strictEqual(count, 4);
        cb();
      }, 500);
    });

    taker.series(series, parallel)(done);
  });

  it("should allow composite tasks tasks to be aliased", function (t, done) {
    var count = 0;
    function fn1(cb) {
      count += 1;
      cb();
    }
    function fn2(cb) {
      count += 2;
      cb();
    }

    taker.task("ser", taker.series(fn1, fn2));
    taker.task("foo", taker.task("ser"));

    taker.task("par", taker.parallel(fn1, fn2));
    taker.task("bar", taker.task("par"));

    var series = taker.series("foo", function (cb) {
      assert.strictEqual(count, 3);
      cb();
    });

    var parallel = taker.series("bar", function (cb) {
      setTimeout(function () {
        assert.strictEqual(count, 6);
        cb();
      }, 500);
    });

    taker.series(series, parallel)(done);
  });
});
