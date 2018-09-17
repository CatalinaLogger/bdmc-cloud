'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  BASE_API: '"http://cloud.bdsmc.net:8000"',
  MAP_URL: '"http://cloud.bdsmc.net:8001"'
})
