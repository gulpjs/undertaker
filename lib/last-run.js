'use strict';

var retrieveLastRun = require('last-run');

function lastRun(task, timeResolution) {
  if(timeResolution == null){
    timeResolution = process.env.UNDERTAKER_TIME_RESOLUTION;
  }

  var fn = task;
  if(typeof task === 'string'){
    fn = this.get(task);
  }

  return retrieveLastRun(fn, timeResolution);
}

module.exports = lastRun;
