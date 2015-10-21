function Util () {}

Util.prototype.path = ''

Util.prototype.open_file = function (file) {
  return this.open_file_with_node(this.path + file)
}

Util.prototype.open_file_with_node = function (file) {
  var fs = require('fs')
  return fs.readFileSync(file, 'binary')
}

Util.prototype.write_file = function (filename, data) {
  this.write_file_with_node(filename, data)
}

Util.prototype.write_file_with_node = function (filename, data) {
  var fs = require('fs')
  fs.writeFileSync(filename, data, 'binary')
}

Util.prototype.on_write_end = function (filename, url) {}

Util.prototype.on_error = function (e) {}

module.exports = Util
