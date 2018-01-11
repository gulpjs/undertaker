'use strict';

// WeakMap for storing metadata
var WeakMap = require('es6-weak-map'); // use native version when it exists
var metadata = new WeakMap();

module.exports = metadata;
