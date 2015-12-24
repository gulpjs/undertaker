'use strict';

module.exports = {
  label: 'Tasks',
  nodes: [
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
      nodes: []
    },
    {
      label: 'noop',
      type: 'task',
      nodes: []
    },
    {
      label: 'par',
      type: 'task',
      nodes: [
        {
          label: '<parallel>',
          type: 'function',
          nodes: [
            {
              label: 'noop',
              type: 'function',
              nodes: []
            },
            {
              label: '<anonymous>',
              type: 'function',
              nodes: []
            },
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
              nodes: []
            }
          ]
        }
      ]
    },
    {
      label: 'ser',
      type: 'task',
      nodes: [
        {
          label: '<series>',
          type: 'function',
          nodes: [
            {
              label: 'noop',
              type: 'function',
              nodes: []
            },
            {
              label: '<anonymous>',
              type: 'function',
              nodes: []
            },
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
              nodes: []
            }
          ]
        }
      ]
    },
  ],
};
