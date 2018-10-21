module.exports = {
  'plugins': [
    [
      '@babel/plugin-proposal-decorators',
      {
        'legacy': true
      }
    ],
    [
      '@babel/plugin-proposal-class-properties',
      {
        'loose': true
      }
    ]
  ],
  'presets': [
    [
      '@babel/preset-env',
      {
        'targets': {
          'chrome': 61,
          'electron': '2.0.2'
        },
        'modules': false,
        'useBuiltIns': 'usage'
      }
    ],
    '@babel/preset-react'
  ],
  'env': {
    'production': {},
    'development': {
      'plugins': [
        'react-hot-loader/babel'
      ]
    },
    'test': {
      'presets': [
        [
          '@babel/preset-env',
          {
            'modules': 'commonjs'
          }
        ]
      ]
    }
  }
}
