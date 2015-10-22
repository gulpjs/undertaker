'use strict';

var WM = require('es6-weak-map');
var hasNativeWeakMap = require('es6-weak-map/is-native-implemented');

// WeakMaps for storing metadata
var metadata = hasNativeWeakMap ? new WeakMap() : new WM();

metadata.aliases = hasNativeWeakMap ? new WeakMap() : new WM();

module.exports = metadata;
