var Utils = require('./utils')
var utils = new Utils()

function dInesprg (arg, cart) {
  cart.setINESPrg(arg)
}

function dIneschr (arg, cart) {
  cart.setINESChr(arg)
}

function dInesmap (arg, cart) {
  cart.setINESMap(arg)
}

function dInesmir (arg, cart) {
  cart.setINESMir(arg)
}

function dBank (arg, cart) {
  cart.setBankId(arg)
}

function dOrg (arg, cart) {
  cart.setOrg(arg)
}

function dDb (arg, cart) {
  var l = []
  arg.forEach(function (t) {
    if (t.type === 'T_ADDRESS') {
      l.push(parseInt(t.value.substring(1, t.value.length), 16))
    } else if (t.type === 'T_BINARY_NUMBER') {
      l.push(parseInt(t.value.substring(1, t.value.length), 2))
    } else if (t.type === 'T_DECIMAL_ARGUMENT') {
      l.push(parseInt(t.value, 10))
    }
  })
  cart.appendCode(l)
}

function dDw (arg, cart) {
  var arg1 = (arg & 0x00ff)
  var arg2 = (arg & 0xff00) >> 8
  cart.appendCode([arg1, arg2])
}

function dIncbin (arg, cart) {
  var bin = []
  var data = utils.openFile(arg)
  for (var i = 0; i < data.length; i++) {
    bin.push(data.charCodeAt(i) & 0xFF)
  }
  cart.appendCode(bin)
}

function dRsset (arg, cart) {
}

function dRs (arg, cart) {
}

var Directives = function () {
  this.directiveList = {}
  this.directiveList['.inesprg'] = dInesprg
  this.directiveList['.ineschr'] = dIneschr
  this.directiveList['.inesmap'] = dInesmap
  this.directiveList['.inesmir'] = dInesmir
  this.directiveList['.bank'] = dBank
  this.directiveList['.org'] = dOrg
  this.directiveList['.db'] = dDb
  this.directiveList['.byte'] = dDb
  this.directiveList['.dw'] = dDw
  this.directiveList['.word'] = dDw
  this.directiveList['.incbin'] = dIncbin
  this.directiveList['.rsset'] = dRsset
  this.directiveList['.rs'] = dRs
}

module.exports = Directives
