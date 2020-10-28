module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '^vue$': 'vue/dist/vue.common.js',
    'nuxt-composition-api': 'nuxt-composition-api/lib/cjs/entrypoint.js'
  },
  moduleFileExtensions: [
    'ts',
    'js',
    'vue',
    'json'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
    '.*\\.(vue)$': 'vue-jest'
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!vee-validate/dist/rules)'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/components/**/*.vue',
    '<rootDir>/pages/**/*.vue',
    '<rootDir>/composables/**/*.ts',
    '<rootDir>/models/**/*.ts',
    '<rootDir>/store/**/*.ts'
  ],
  globals: {
    'vue-jest': {
      pug: { doctype: 'html' }
    }
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  restoreMocks: true
}
