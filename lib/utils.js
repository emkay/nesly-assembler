function Util () {}

Util.prototype.openFile = function (file) {
  return this.openFileWithNode('./example/' + file)
}

Util.prototype.openFileWithNode = function (file) {
  var fs = require('fs')
  return fs.readFileSync(file, 'binary')
}

Util.prototype.writeFile = function (filename, data) {
  this.writeFileWithNode(filename, data)
}

Util.prototype.writeFileWithNode = function (filename, data) {
  var fs = require('fs')
  fs.writeFileSync(filename, data, 'binary')
}

Util.prototype.onWriteEnd = function (filename, url) {}

Util.prototype.onError = function (e) {}

module.exports = Util
