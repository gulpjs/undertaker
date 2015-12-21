'use strict';

var path = require('path');

module.exports = {
  label: 'Tasks',
  nodes: [
    {
      label: 'fn1',
      type: 'task',
      sourceFilePath: path.join(__dirname, '../../tree.js'),
      nodes: [],
    },
    {
      label: 'fn2',
      type: 'task',
      sourceFilePath: path.join(__dirname, '../../tree.js'),
      nodes: [],
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
              nodes: [],
            },
            {
              label: 'fn2',
              type: 'task',
              sourceFilePath: path.join(__dirname, '../../tree.js'),
              nodes: [],
            },
          ],
        },
      ],
    },
  ],
};
