'use strict';

module.exports = [
  {
    label: 'fn1',
    type: 'task',
    nodes: [
      {
        label: '<parallel>',
        type: 'function',
        nodes: [
          {
            label: '<anonymous>',
            type: 'function',
            nodes: []
          },
          {
            label: 'noop',
            type: 'function',
            nodes: []
          }
        ]
      }
    ]
  },
  {
    label: 'fn2',
    type: 'task',
    nodes: [
      {
        label: '<parallel>',
        type: 'function',
        nodes: [
          {
            label: '<anonymous>',
            type: 'function',
            nodes: []
          },
          {
            label: 'noop',
            type: 'function',
            nodes: []
          }
        ]
      }
    ]
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
            nodes: [
              {
                label: '<parallel>',
                type: 'function',
                nodes: [
                  {
                    label: '<anonymous>',
                    type: 'function',
                    nodes: []
                  },
                  {
                    label: 'noop',
                    type: 'function',
                    nodes: []
                  }
                ]
              }
            ],
          },
          {
            label: 'fn2',
            type: 'task',
            nodes: [
              {
                label: '<parallel>',
                type: 'function',
                nodes: [
                  {
                    label: '<anonymous>',
                    type: 'function',
                    nodes: []
                  },
                  {
                    label: 'noop',
                    type: 'function',
                    nodes: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];
