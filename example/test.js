var Compiler = require('..')
var compiler = new Compiler()

var code = compiler.openFile('./build/start.s')

try {
  var bin = compiler.nesCompiler(code)
  compiler.writeFile('./build/out.nes', bin)
} catch (e) {
  e.forEach(function (error) {
    console.error(error)
  })
  process.exit(1)
}
