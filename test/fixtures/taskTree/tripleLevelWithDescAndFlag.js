'use strict';

module.exports = {
  label: 'Tasks',
  nodes: [
    {
      label: 'fn1',
      type: 'task',
      description: 'Task #1.',
      flag: {
        '--opt1': 'Option 1.',
        '--opt2': 'Option 2.',
      },
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
      description: 'Task #2.',
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
      label: 'fn3',
      type: 'task',
      flag: {
        '--opt3': 'Option 3.',
        '--opt4': 'Option 4.',
      },
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
