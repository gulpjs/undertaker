'use strict';

module.exports = [
  {
    label: 'fn1',
    type: 'task',
    nodes: []
  },
  {
    label: 'fn2',
    type: 'task',
    nodes: []
  },
  {
    label: 'fn3',
    type: 'task',
    nodes: [
      {
        label: '<series>',
        type: 'function',
        nodes: [
          {
            label: 'fn1',
            type: 'task',
            nodes: [],
          },
          {
            label: 'fn2',
            type: 'task',
            nodes: []
          }
        ]
      }
    ]
  }
];
