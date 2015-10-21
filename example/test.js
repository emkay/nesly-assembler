var Compiler = require('..')
var compiler = new Compiler()

var code = compiler.open_file('./build/drums.asm')

try {
  var bin = compiler.nes_compiler(code)
  compiler.write_file('./build/out.nes', bin)
} catch (e) {
  console.error(e)
  process.exit(1)
}
