"use strict";

var assert = require("node:assert");
var { beforeEach, describe, it } = require("node:test");

var Undertaker = require("../");

var simple = require("./fixtures/taskTree/simple");
var singleLevel = require("./fixtures/taskTree/singleLevel");
var doubleLevel = require("./fixtures/taskTree/doubleLevel");
var tripleLevel = require("./fixtures/taskTree/tripleLevel");
var aliasSimple = require("./fixtures/taskTree/aliasSimple");
var aliasNested = require("./fixtures/taskTree/aliasNested");

function noop(done) {
  done();
}

describe("tree", function () {
  var taker;

  beforeEach(function () {
    taker = new Undertaker();
  });

  it("should return a simple tree by default", function () {
    taker.task("test1", function (cb) {
      cb();
    });
    taker.task("test2", function (cb) {
      cb();
    });
    taker.task("test3", function (cb) {
      cb();
    });
    taker.task("error", function (cb) {
      cb();
    });

    var ser = taker.series("test1", "test2");
    var anon = function (cb) {
      cb();
    };
    anon.displayName = "<display name>";

    taker.task("ser", taker.series("test1", "test2"));
    taker.task("par", taker.parallel("test1", "test2", "test3"));
    taker.task("serpar", taker.series("ser", "par"));
    taker.task("serpar2", taker.series(ser, anon));
    taker.task(anon);

    var tree = taker.tree();

    assert.deepStrictEqual(tree, simple);
  });

  it("should form a 1 level tree", function () {
    taker.task("fn1", function (cb) {
      cb();
    });
    taker.task("fn2", function (cb) {
      cb();
    });

    var tree = taker.tree({ deep: true });

    assert.deepStrictEqual(tree, singleLevel);
  });

  it("should form a 2 level nested tree", function () {
    taker.task("fn1", function (cb) {
      cb();
    });
    taker.task("fn2", function (cb) {
      cb();
    });
    taker.task("fn3", taker.series("fn1", "fn2"));

    var tree = taker.tree({ deep: true });

    assert.deepStrictEqual(tree, doubleLevel);
  });

  it("should form a 3 level nested tree", function () {
    taker.task(
      "fn1",
      taker.parallel(function (cb) {
        cb();
      }, noop),
    );
    taker.task(
      "fn2",
      taker.parallel(function (cb) {
        cb();
      }, noop),
    );
    taker.task("fn3", taker.series("fn1", "fn2"));

    var tree = taker.tree({ deep: true });

    assert.deepStrictEqual(tree, tripleLevel);
  });

  it("should use the proper labels for aliased tasks (simple)", function () {
    var anon = function (cb) {
      cb();
    };
    taker.task(noop);
    taker.task("fn1", noop);
    taker.task("fn2", taker.task("noop"));
    taker.task("fn3", anon);
    taker.task("fn4", taker.task("fn3"));

    var tree = taker.tree({ deep: true });

    assert.deepStrictEqual(tree, aliasSimple);
  });

  it("should use the proper labels for aliased tasks (nested)", function () {
    taker.task(noop);
    taker.task("fn1", noop);
    taker.task("fn2", taker.task("noop"));
    taker.task("fn3", function (cb) {
      cb();
    });
    taker.task(
      "ser",
      taker.series(
        noop,
        function (cb) {
          cb();
        },
        "fn1",
        "fn2",
        "fn3",
      ),
    );
    taker.task(
      "par",
      taker.parallel(
        noop,
        function (cb) {
          cb();
        },
        "fn1",
        "fn2",
        "fn3",
      ),
    );

    var tree = taker.tree({ deep: true });

    assert.deepStrictEqual(tree, aliasNested);
  });
});
