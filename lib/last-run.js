'use strict';

function lastRun(task){
  /* jshint validthis: true */
  if(this._lastRuns[task]){
    return this._lastRuns[task];
  }
}

module.exports = lastRun;
