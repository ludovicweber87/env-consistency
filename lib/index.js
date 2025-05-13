module.exports = {
  rules: {
    'check-env-vars': require('./rules/check-env-vars'),
  },
  configs: {
    recommended: {
      plugins: ['env-consistency'],
      rules: {
        'env-consistency/check-env-vars': 'error',
      },
    },
  },
};