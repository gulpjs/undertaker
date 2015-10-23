'use strict';

// WeakMaps for storing metadata
var WM = require('es6-weak-map');
var metadata = new WM();
metadata.aliases = new WM();

module.exports = metadata;
