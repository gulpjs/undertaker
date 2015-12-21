'use strict';

var _ = require('lodash');
var callsite = require('callsite');

function findSourceFilePath(filterPath) {
  var stack = callsite();

  var site = _.find(stack, function(site) {
    var filepath = site.getFileName();
    return !_.startsWith(filepath, filterPath);
  });

  return site.getFileName();
}

module.exports = findSourceFilePath;
