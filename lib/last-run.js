'use strict';

var metadata = require('./helpers/metadata');

var match = process.version.match(/v(\d+)\.(\d+)\.(\d+)/);
var nodeVersion = {
  major: match[1],
  minor: match[2],
  patch: match[3]
};

function defaultResolution() {
  var resolution = parseInt(process.env.UNDERTAKER_TIME_RESOLUTION, 10) || 0;

  if (resolution) {
    return resolution;
  }

  // Set the default
  return (nodeVersion.major === 0 && nodeVersion.minor <= 10) ? 1000 : 0;
}

function getTaskId(task, taker) {
  var fn = typeof task === 'function' ? task : taker.get(task);
  return metadata.getTaskId(fn);
}

function lastRun(task, timeResolution) {
  /* jshint validthis: true */
  var id = getTaskId(task, this);

  timeResolution = timeResolution == null ? this._timeResolution : timeResolution;

  if (id == null || !this._lastRuns[id]) {
    return;
  }

  var t = this._lastRuns[id].time;
  return timeResolution ? t - (t % timeResolution) : t;
}

function init(taker) {
  taker._lastRuns = {};
  taker._timeResolution = defaultResolution();

  taker.on('start', function(e) {
    var meta = taker._lastRuns[e.taskId];

    if (!meta) {
      meta = taker._lastRuns[e.taskId] = {};
    }

    meta.uid = e.uid;
    meta.startTime = e.time;
  });

  taker.on('error', function(e) {
    var meta = taker._lastRuns[e.taskId];

    if (
      meta == null ||
      meta.uid == null ||
      meta.uid !== e.uid
    ) {
      return;
    }

    meta.uid = undefined;
    meta.startTime = undefined;
  });

  taker.on('stop', function(e) {
    var meta = taker._lastRuns[e.taskId];

    if (
      meta == null ||
      meta.uid == null ||
      meta.startTime == null ||
      meta.uid !== e.uid
    ) {
      return;
    }

    meta.time = meta.startTime;
    meta.uid = undefined;
    meta.startTime = undefined;
  });
}

module.exports = {
  get: lastRun,
  init: init,
  nodeVersion: nodeVersion,
  defaultResolution: defaultResolution
};
