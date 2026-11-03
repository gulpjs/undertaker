"use strict";

var assert = require("node:assert");
var { describe, it } = require("node:test");

var Undertaker = require("../");

var DefaultRegistry = require("undertaker-registry");
var CommonRegistry = require("undertaker-common-tasks");
var MetadataRegistry = require("undertaker-task-metadata");

function noop() {}

function CustomRegistry() {}
CustomRegistry.prototype.init = noop;
CustomRegistry.prototype.get = noop;
CustomRegistry.prototype.set = noop;
CustomRegistry.prototype.tasks = noop;

function SetNoReturnRegistry() {
  this._tasks = {};
}
SetNoReturnRegistry.prototype.init = noop;
SetNoReturnRegistry.prototype.get = function (name) {
  return this.tasks[name];
};
SetNoReturnRegistry.prototype.set = function (name, fn) {
  this.tasks[name] = fn;
};
SetNoReturnRegistry.prototype.tasks = noop;

function InvalidRegistry() {}

function InvalidProtoRegistry() {}
InvalidProtoRegistry.prototype = InvalidRegistry;

describe("registry", function () {
  describe("method", function () {
    it("should return the current registry when no arguments are given", function () {
      var taker = new Undertaker();
      assert.strictEqual(taker.registry(), taker._registry);
    });

    it("should set the registry to the given registry instance argument", function () {
      var taker = new Undertaker();
      var customRegistry = new CustomRegistry();
      taker.registry(customRegistry);
      assert.strictEqual(taker.registry(), customRegistry);
    });

    it("should validate the custom registry instance", function () {
      var taker = new Undertaker();
      var invalid = new InvalidRegistry();

      function invalidSet() {
        taker.registry(invalid);
      }

      assert.throws(invalidSet, {
        message: "Custom registry must have `get` function",
      });
    });

    it("should transfer all tasks from old registry to new", function () {
      var taker = new Undertaker(new CommonRegistry());
      var customRegistry = new DefaultRegistry();
      taker.registry(customRegistry);

      assert.strictEqual(typeof taker.task("clean"), "function");
      assert.strictEqual(typeof taker.task("serve"), "function");
    });

    it("allows multiple custom registries to used", function (t, done) {
      var taker = new Undertaker();
      taker.registry(new CommonRegistry());

      assert.strictEqual(typeof taker.task("clean"), "function");
      assert.strictEqual(typeof taker.task("serve"), "function");

      taker.registry(new MetadataRegistry());
      taker.task("context", function (cb) {
        assert.deepStrictEqual(this, { name: "context" });
        cb();
        done();
      });

      taker.registry(new DefaultRegistry());

      assert.strictEqual(typeof taker.task("clean"), "function");
      assert.strictEqual(typeof taker.task("serve"), "function");
      assert.strictEqual(typeof taker.task("context"), "function");

      taker.series("context")();
    });

    it("throws with a descriptive method when constructor is passed", function () {
      var taker = new Undertaker();

      function ctor() {
        taker.registry(CommonRegistry);
      }

      assert.throws(ctor, {
        message:
          "Custom registries must be instantiated, but it looks like you passed a constructor",
      });
    });

    it("calls into the init function after tasks are transferred", function () {
      var taker = new Undertaker(new CommonRegistry());

      var ogInit = DefaultRegistry.prototype.init;

      DefaultRegistry.prototype.init = function (inst) {
        assert.strictEqual(inst, taker);
        assert.strictEqual(typeof inst.task("clean"), "function");
        assert.strictEqual(typeof inst.task("serve"), "function");
      };

      taker.registry(new DefaultRegistry());

      DefaultRegistry.prototype.init = ogInit;
    });
  });

  describe("constructor", function () {
    it("should take a custom registry on instantiation", function () {
      var taker = new Undertaker(new CustomRegistry());
      assert.ok(taker.registry() instanceof CustomRegistry);
      assert.strictEqual(taker.registry() instanceof DefaultRegistry, false);
    });

    it("should default to undertaker-registry if not constructed with custom registry", function () {
      var taker = new Undertaker();
      assert.ok(taker.registry() instanceof DefaultRegistry);
      assert.strictEqual(taker.registry() instanceof CustomRegistry, false);
    });

    it("should take a registry that pre-defines tasks", function () {
      var taker = new Undertaker(new CommonRegistry());
      assert.ok(taker.registry() instanceof CommonRegistry);
      assert.ok(taker.registry() instanceof DefaultRegistry);
      assert.strictEqual(typeof taker.task("clean"), "function");
      assert.strictEqual(typeof taker.task("serve"), "function");
    });

    it("should throw upon invalid registry", function () {
      var taker = new Undertaker(new CommonRegistry());
      assert.throws(
        function () {
          taker.registry(new InvalidProtoRegistry());
        },
        { message: "Custom registry must have `get` function" },
      );
    });

    it("should throw upon invalid registry", function (done) {
      /* eslint no-unused-vars: 0 */
      var taker;

      function noGet() {
        taker = new Undertaker(new InvalidRegistry());
      }

      assert.throws(noGet, {
        message: "Custom registry must have `get` function",
      });
      InvalidRegistry.prototype.get = noop;

      function noSet() {
        taker = new Undertaker(new InvalidRegistry());
      }

      assert.throws(noSet, {
        message: "Custom registry must have `set` function",
      });
      InvalidRegistry.prototype.set = noop;

      function noInit() {
        taker = new Undertaker(new InvalidRegistry());
      }

      assert.throws(noInit, {
        message: "Custom registry must have `init` function",
      });
      InvalidRegistry.prototype.init = noop;

      function noTasks() {
        taker = new Undertaker(new InvalidRegistry());
      }

      assert.throws(noTasks, {
        message: "Custom registry must have `tasks` function",
      });
      InvalidRegistry.prototype.tasks = noop;

      taker = new Undertaker(new InvalidRegistry());
    });
  });

  it("does not require the `set` method to return a task", function (t, done) {
    var taker = new Undertaker();
    taker.registry(new SetNoReturnRegistry());
    taker.task("test", noop);
    taker.on("start", function (data) {
      assert.strictEqual(data.name, "test");
      done();
    });
    taker.series("test")();
  });

  it("should fail if task name is of an inherited property", function () {
    var tasks = {};
    tasks.__proto__ = { notOwnProp: 1 };

    function MyRegistry() {}
    MyRegistry.prototype.init = noop;
    MyRegistry.prototype.get = noop;
    MyRegistry.prototype.set = noop;
    MyRegistry.prototype.tasks = function () {
      return tasks;
    };

    var registry = new MyRegistry();
    var taker = new Undertaker(registry);

    function fail() {
      taker.series("notOwnProp");
    }

    assert.throws(fail, { message: /Task never defined: notOwnProp/ });
  });

  it("should fail and offer tasks which are close in name", function () {
    var taker = new Undertaker(new CommonRegistry());
    var customRegistry = new DefaultRegistry();
    taker.registry(customRegistry);

    function fail() {
      taker.series("clear");
    }
    assert.throws(fail, {
      message: /Task never defined: clear - did you mean\? clean/,
    });
  });
});
