var Compiler = require('..')
var compiler = new Compiler()

var code = compiler.open_file('./build/start.s')

try {
  var bin = compiler.nes_compiler(code)
  compiler.write_file('./build/out.nes', bin)
} catch (e) {
  e.forEach(function (error) {
    console.error(error)
  })
  process.exit(1)
}
