'use strict';

var uid = 0;

var metadata = require('./metadata');

function Storage(name){
  this.uid = uid++;
  this.name = name;
}

function createExtensions(ee){
  return {
    create: function(fn){
      var meta = metadata.get(fn);
      return new Storage(meta.name);
    },
    before: function(storage){
      storage.startHr = process.hrtime();
      ee.emit('start', {
        uid: storage.uid,
        name: storage.name,
        time: Date.now()
      });
    },
    after: function(result, storage){
      if(result && result.state === 'error'){
        return this.error(result.value, storage);
      }
      ee.emit('stop', {
        uid: storage.uid,
        name: storage.name,
        duration: process.hrtime(storage.startHr),
        time: Date.now()
      });
    },
    error: function(error, storage){
      if(Array.isArray(error)){
        error = error[0];
      }

      ee.emit('error', {
        uid: storage.uid,
        name: storage.name,
        error: error,
        duration: process.hrtime(storage.startHr),
        time: Date.now()
      });
    }
  };
}

module.exports = createExtensions;
