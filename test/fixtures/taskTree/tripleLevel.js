'use strict';

var path = require('path');

module.exports = {
  label: 'Tasks',
  nodes: [
    {
      label: 'fn1',
      type: 'task',
      sourceFilePath: path.join(__dirname, '../../tree.js'),
      nodes: [
        {
          label: '<parallel>',
          type: 'function',
          sourceFilePath: path.join(__dirname, '../../tree.js'),
          nodes: [
            {
              label: '<anonymous>',
              type: 'function',
              sourceFilePath: null,
              nodes: [],
            },
            {
              label: 'noop',
              type: 'function',
              sourceFilePath: null,
              nodes: [],
            },
          ],
        },
      ],
    },
    {
      label: 'fn2',
      type: 'task',
      sourceFilePath: path.join(__dirname, '../../tree.js'),
      nodes: [
        {
          label: '<parallel>',
          type: 'function',
          sourceFilePath: path.join(__dirname, '../../tree.js'),
          nodes: [
            {
              label: '<anonymous>',
              type: 'function',
              sourceFilePath: null,
              nodes: [],
            },
            {
              label: 'noop',
              type: 'function',
              sourceFilePath: null,
              nodes: [],
            },
          ],
        },
      ],
    },
    {
      label: 'fn3',
      type: 'task',
      sourceFilePath: path.join(__dirname, '../../tree.js'),
      nodes: [
        {
          label: '<series>',
          type: 'function',
          sourceFilePath: path.join(__dirname, '../../tree.js'),
          nodes: [
            {
              label: 'fn1',
              type: 'task',
              sourceFilePath: path.join(__dirname, '../../tree.js'),
              nodes: [
                {
                  label: '<parallel>',
                  type: 'function',
                  sourceFilePath: path.join(__dirname, '../../tree.js'),
                  nodes: [
                    {
                      label: '<anonymous>',
                      type: 'function',
                      sourceFilePath: null,
                      nodes: [],
                    },
                    {
                      label: 'noop',
                      type: 'function',
                      sourceFilePath: null,
                      nodes: [],
                    },
                  ],
                },
              ],
            },
            {
              label: 'fn2',
              type: 'task',
              sourceFilePath: path.join(__dirname, '../../tree.js'),
              nodes: [
                {
                  label: '<parallel>',
                  type: 'function',
                  sourceFilePath: path.join(__dirname, '../../tree.js'),
                  nodes: [
                    {
                      label: '<anonymous>',
                      type: 'function',
                      sourceFilePath: null,
                      nodes: [],
                    },
                    {
                      label: 'noop',
                      type: 'function',
                      sourceFilePath: null,
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
