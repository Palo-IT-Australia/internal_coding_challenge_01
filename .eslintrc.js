const ERROR = 2;
const WARNING = 1;
const DISABLE = 0;

module.exports = {
  'extends': 'airbnb-base',
  'globals': {
  },
  'env': {
    'es6': true,
    'node': true,
    'jest': true
  },
  'parserOptions': {
    'sourceType': 'module',
    'ecmaVersion': 8,
    'ecmaFeatures': {
      'jsx': true
    }
  },
  'rules': {
    'comma-dangle': [ ERROR, 'never' ],
    'no-unused-vars': ERROR,
    'quotes': [ERROR, 'single'],
    'indent': [ERROR, 2],
    'no-plusplus': [DISABLE, 2]
  }
};
