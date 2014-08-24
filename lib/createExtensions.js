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
      var name;

      if(meta){
        name = meta.name;
      } else {
        name = fn.name;
      }

      return new Storage(name);
    },
    before: function(storage){
      storage.startHr = process.hrtime();
      ee.emit('start', {
        uid: storage.uid,
        name: storage.name,
        time: Date.now()
      });
    },
    after: function(storage){
      ee.emit('stop', {
        uid: storage.uid,
        name: storage.name,
        duration: process.hrtime(storage.startHr),
        time: Date.now()
      });
    },
    error: function(storage){
      ee.emit('error', {
        uid: storage.uid,
        name: storage.name,
        duration: process.hrtime(storage.startHr),
        time: Date.now()
      });
    }
  };
}

module.exports = createExtensions;
