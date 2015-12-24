'use strict';

module.exports = {
  label: 'Tasks',
  nodes: [
    {
      label: '[fn1] : Fn 1',
      type: 'task',
      description: 'Fn 1',
      nodes: [
        {
          label: '<parallel>',
          type: 'function',
          nodes: [
            {
              label: '<anonymous>',
              type: 'function',
              nodes: [],
            },
            {
              label: 'noop',
              type: 'function',
              nodes: [],
            },
          ],
        },
      ],
    },
    {
      label: '[fn2] : Fn 2',
      type: 'task',
      description: 'Fn 2',
      nodes: [
        {
          label: '<parallel>',
          type: 'function',
          nodes: [
            {
              label: '<anonymous>',
              type: 'function',
              nodes: [],
            },
            {
              label: 'noop',
              type: 'function',
              nodes: [],
            },
          ],
        },
      ],
    },
    {
      label: '[fn3] : Fn 3',
      type: 'task',
      description: 'Fn 3',
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
                      nodes: [],
                    },
                    {
                      label: 'noop',
                      type: 'function',
                      nodes: [],
                    },
                  ],
                },
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
                      nodes: [],
                    },
                    {
                      label: 'noop',
                      type: 'function',
                      nodes: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
