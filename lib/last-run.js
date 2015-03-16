'use strict';

function lastRun(task){
  /* jshint validthis: true */
  if(this._lastRuns[task]){
    return this._lastRuns[task].time;
  }
}

function init(taker){
  taker._lastRuns = {};

  taker.on('start', function(e){
    var meta = taker._lastRuns[e.name];

    if (!meta) {
      meta = taker._lastRuns[e.name] = {};
    }

    meta.uid = e.uid;
    meta.startTime = e.time;
  });

  taker.on('error', function(e){
    var meta = taker._lastRuns[e.name];

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

  taker.on('stop', function(e){
    var meta = taker._lastRuns[e.name];

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
  init: init
};
