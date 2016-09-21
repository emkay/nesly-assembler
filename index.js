const bole = require('bole')
bole.output([
  { level: 'info', stream: process.stdout },
  { level: 'debug', stream: process.stdout },
  { level: 'error', stream: process.stdout }
])
module.exports = require('./compiler')
