var Compiler = require('./');
var compiler = new Compiler();

var code = compiler.open_file('./build/start.s');

try {
    var bin = compiler.nes_compiler(code);
    compiler.write_file('./out.nes', bin);
} catch (e){
    console.log('hello');
    console.error(e);
    process.exit(1);
}
