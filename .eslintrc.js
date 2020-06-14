module.exports = {
  'extends': ['airbnb', 'airbnb/hooks', 'prettier', 'prettier/react'],
  root: true,
  parser: 'babel-eslint',
  plugins: ['import', 'react', 'react-hooks', 'prettier'],
  env: {
    browser: true
  },
  settings: {
    react: {
      version: '16.13'
    },
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules', '/', 'src'],
        extensions: ['.js']
      }
    }
  },
  rules: {
    'no-console': 'error',
    'react/forbid-prop-types': 0,
    'react/require-default-props': 0,
    'react/jsx-filename-extension': 0,
    'import/no-named-as-default': 0,
    'import/no-unresolved': [2, { commonjs: true }],
    'react/jsx-props-no-spreading': 0,
    'no-return-await': 2,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true, // airbnb
        trailingComma: 'all', // airbnb
        bracketSpacing: true,
        jsxBracketSameLine: true,
        printWidth: 80,
        tabWidth: 2,
        useTabs: false
      }
    ]
  },
  overrides: [
    {
      files: ['./functions/**'],
      'extends': ['plugin:jsdoc/recommended'],
      plugins: ['jsdoc'],
      settings: {
        'import/resolver': {
          node: {
            moduleDirectory: ['functions/node_modules', 'functions/']
          }
        }
      },
      rules: {
        'no-console': 0,
        'jsdoc/newline-after-description': 0
      }
    },
    {
      files: ['functions/src/**/*.spec.js'],
      env: {
        mocha: true
      },
      globals: {
        functionsTest: true,
        projectId: true,
        expect: true,
        sinon: true
      },
      rules: {
        'no-console': 0,
        'func-names': 0,
        'import/no-dynamic-require': 0,
        'no-unused-expressions': 0,
        'import/prefer-default-export': 0
      }
    },
    {
      files: ['functions/scripts/**.js'],
      env: {
        mocha: true
      },
      globals: {
        functionsTest: true,
        projectId: true,
        expect: true,
        sinon: true
      },
      rules: {
        'import/no-extraneous-dependencies': 0
      }
    },
    {
      files: ['./public/firebase-messaging-sw.js'],
      env: {
        browser: true
      },
      globals: {
        self: true,
        firebase: true,
        importScripts: true
      },
      rules: {
       'no-restricted-globals': 0,
        'no-console': 0
      }
    },
    {
      files: ['./bin/**'],
      rules: {
        'no-console': 0,
        'import/no-extraneous-dependencies': 0
      }
    }
  ]
}
