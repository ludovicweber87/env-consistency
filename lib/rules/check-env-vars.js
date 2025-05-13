const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensures that all .env.* files have the same keys as the reference file',
      category: 'Possible Errors',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          dist: { type: 'string' },
          envs: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missing: 'Missing key in {{file}}: "{{key}}"',
      extra:   'Extra key in {{file}}: "{{key}}"',
      noDist:  'Reference file "{{dist}}" not found',
    },
  },

  create(context) {
    const cwd = context.getCwd ? context.getCwd() : process.cwd();
    const options = context.options[0] || {};
    const distFile = options.dist || '.env.dist';
    const envNames = options.envs || ['local','staging','production','test','example'];

    const distPath = path.join(cwd, distFile);
    if (!fs.existsSync(distPath)) {
      context.report({
        loc: { line: 1, column: 0 },
        messageId: 'noDist',
        data: { dist: distFile },
      });
      return {};
    }

    const reference = dotenv.parse(fs.readFileSync(distPath));

    return {
      Program(node) {
        envNames.forEach(env => {
          const file = `.env.${env}`;
          const filePath = path.join(cwd, file);
          if (!fs.existsSync(filePath)) {
            return;
          }
          const vars = dotenv.parse(fs.readFileSync(filePath));

          Object.keys(reference).forEach(key => {
            if (!(key in vars)) {
              context.report({
                node,
                messageId: 'missing',
                data: { file, key },
              });
            }
          });
          Object.keys(vars).forEach(key => {
            if (!(key in reference)) {
              context.report({
                node,
                messageId: 'extra',
                data: { file, key },
              });
            }
          });
        });
      },
    };
  },
};