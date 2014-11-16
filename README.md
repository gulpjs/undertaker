undertaker
==========

[![Build Status](https://travis-ci.org/phated/undertaker.svg?branch=master)](https://travis-ci.org/phated/undertaker)

Task registry that allows composition through `series`/`parallel` methods.

## Usage

```js
var fs = require('fs');
var Undertaker = require('undertaker');

var taker = new Undertaker();

taker.task('task1', function(cb){
  // do things

  cb(); // when everything is done
});

taker.task('task2', function(){
  return fs.createReadStream('./myFile.js')
    .pipe(fs.createWriteStream('./myFile.copy.js'));
});

taker.task('task3', function(){
  return new Promise(function(resolve, reject){
    // do things

    resolve(); // when everything is done
  });
});

taker.task('combined', taker.series('task1', 'task2'));

taker.task('all', taker.parallel('combined', 'task3'));
```

## API

__Task functions can be completed in any of the ways supported by
[`async-done`](https://github.com/phated/async-done#completion-and-error-resolution)__

### `new Undertaker([RegistryConstructor])`

The constructor is used to create a new instance of `Undertaker`. Each instance of
`Undertaker` gets its own instance of a registry. By default, the registry is an
instance of [`undertaker-registry`](https://github.com/phated/undertaker-registry)
but it can be any other registry that follows the [Custom Registries API](#custom-registries).

To use a custom registry, pass the custom registry's constructor function when
instantiating a new `Undertaker` instance. This will use the custom constructor
to create the registry for this instance.

### `get(taskName)` => Function

Takes a string (`taskName`) representing the name of a register task and
returns the registered function.

### `set(taskName, fn)`

Takes a string (`taskName`) and a function (`fn`) to register as a task.
The `fn` gets registered in the registry by the `taskName`.

Will throw if:

* `taskName` is missing or not a string
* `fn` is missing or not a function

### `task([taskName,] fn)` => [Function]

An alias for `get` and `set`. If a string (`taskName`) is given as the only
argument, the `get` method will be called. If a function (`fn`) and optionally
a string (`taskName`) is given, the `set` method will be called.

This function allows you to pass a named function as the only argument and its
name will be turned into the `taskName` when the `set` method is called.

Will throw in the same ways mentioned in `get` and `set`.

### `series(taskName || fn...)` => Function

Takes a variable amount of strings (`taskName`) and/or functions (`fn`) and
returns a function of the composed tasks or functions. Any `taskNames` are
retrieved from the registry using the `get` method.

When the returned function is executed, the tasks or functions will be executed
in series, each waiting for the prior to finish. If an error occurs, execution
will stop.

### `parallel(taskName || fn...)` => Function

Takes a variable amount of strings (`taskName`) and/or functions (`fn`) and
returns a function of the composed tasks or functions. Any `taskNames` are
retrieved from the registry using the `get` method.

When the returned function is executed, the tasks or functions will be executed
in parallel, all being executed at the same time. If an error occurs, all execution
will complete.

### `registry([registryInstance])`

Optionally takes an instantiated registry object. If no arguments are passed, returns
the current registry object. If an instance of a registry (`customRegistry`) is passed
the tasks from the current registry will be transferred to it and the current registry
will be replaced with the new registry.

The ability to assign new registries will allow you to pre-define/share tasks or add
custom functionality to your registries. See [Custom Registries](#custom-registries)
for more information.

### `tree([options])` => Object

Optionally takes an object (`options`) and returns an object representing the
tree of registered tasks. The object returned is [`archy`](https://www.npmjs.org/package/archy)
compatible when assigned to the `nodes` key. Also, each node has a `type`
property that can be used to determine if the node is a `task` or `function`.

#### `options`

* `deep` - if the whole tree should be returned (Default: `false`)

## Custom Registries

Coming Soon...

## License

MIT
