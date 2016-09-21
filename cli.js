#!/usr/bin/node

var log = require('bole')('cli')
var program = require('commander')
var Compiler = require('./index')
var compiler = new Compiler()
var version = require('./package').version

/**
 * setup command line parsing
 */
program
  .version(version)
  .usage('[options]')
  .option('-i, --input-file [value]', 'Input file')
  .option('-o, --output-file', 'Output file')
  .parse(process.argv)

var input = program.args[0] || program.inputFile
var code = compiler.openFile(input)
var output = program.outputFile || program.args[1] || 'out.nes'

try {
  var bin = compiler.nesCompiler(code)
  compiler.writeFile(output, bin)
} catch (e) {
  e.forEach(function (error) {
    log.error('Error: ', error)
  })
  process.exit(1)
}
