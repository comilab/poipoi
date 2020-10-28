module.exports = {
  extends: [
    'stylelint-config-standard'
  ],
  plugins: [
    'stylelint-use-nesting'
  ],
  // add your custom config here
  // https://stylelint.io/user-guide/configuration
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen'
        ]
      }
    ]
  }
}
