var expect = require('expect');

var Undertaker = require('../');

describe('set-task', function() {
  var taker;

  beforeEach(function(done) {
    taker = new Undertaker();
    done();
  });

  it('should check preconditions', function(done) {
    expect(function() {
      taker._setTask('v4task', ['v3task1', 'v3task2']);
    }).toThrow('Task function must be specified for "v4task"' +
      ', instead got "v3task1,v3task2"');

    done();
  });
});
