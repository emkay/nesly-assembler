function Cartridge () {
  this.banks = []
  this.bank_id = 0
  this.pc = 0
  this.inesprg = 1
  this.ineschr = 1
  this.inesmap = 1
  this.inesmir = 1
  this.rs = 0
}

Cartridge.prototype.nesId = function () {
  // NES
  return [0x4e, 0x45, 0x53, 0x1a]
}

Cartridge.prototype.nesGetHeader = function () {
  var id = this.nesId()
  var unused = [0, 0, 0, 0, 0, 0, 0, 0]
  var header = []
  header = header.concat(id)
  header.push(this.inesprg)
  header.push(this.ineschr)
  header.push(this.inesmir)
  header.push(this.inesmap)
  header = header.concat(unused)
  return header
}

Cartridge.prototype.setINESPrg = function (inesprg) {
  this.inesprg = inesprg
}

Cartridge.prototype.setINESChr = function (ineschr) {
  this.ineschr = ineschr
}

Cartridge.prototype.setINESMap = function (inesmap) {
  this.inesmap = inesmap
}

Cartridge.prototype.setINESMir = function (inesmir) {
  this.inesmir = inesmir
}

Cartridge.prototype.setBankId = function (id) {
  if (this.banks[id] === undefined) {
    this.banks[id] = {code: [], start: null, size: (1024 * 8)}
    this.bankId = id
  }
}

Cartridge.prototype.setOrg = function (org) {
  if (this.banks[this.bankId] === undefined) {
    this.setBankId(this.bankId)
  }
  if (this.banks[this.bankId].start === null) {
    this.banks[this.bankId].start = org
    this.pc = org
  } else {
    while (this.pc < org) {
      this.appendCode([0xff])
    }
    this.pc = org
  }
}

Cartridge.prototype.appendCode = function (code) {
  if (this.banks[this.bankId] === undefined) {
    this.setBankId(this.bankId)
  }
  for (var c in code) {
    // assert c <= 0xff
    this.banks[this.bankId].code.push(code[c])
    this.pc++
  }
}

Cartridge.prototype.getCode = function () {
  if (this.banks[this.bankId] === undefined) {
    this.setBankId(this.bankId)
  }
  return this.banks[this.bankId].code
}

Cartridge.prototype.getInesCode = function () {
  if (this.banks[this.bankId] === undefined) {
    this.setBankId(this.bankId)
  }
  var bin = []
  var nesHeader = this.nesGetHeader()
  bin = bin.concat(nesHeader)
  for (var b in this.banks) {
    for (var j = this.banks[b].code.length; j < this.banks[b].size; j++) {
      this.banks[b].code.push(0xff)
    }
    bin = bin.concat(this.banks[b].code)
  }
  return bin
}

module.exports = Cartridge
