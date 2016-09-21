const fs = require('fs')
const log = require('bole')('compiler')
const analyse = require('./lib/analyzer')
const CPU = require('./lib/c6502')
const cpu = new CPU()
const Cartridge = require('./lib/cartridge')
const Directives = require('./lib/directives')
const directives = new Directives()
const asm65Tokens = require('./lib/tokens')

function Compiler () {}

Compiler.prototype.openFile = function (file) {
  log.info('openFile', file)
  return fs.readFileSync(file, 'binary')
}

Compiler.prototype.writeFile = function (filename, data) {
  log.info('writeFile')
  fs.writeFileSync(filename, data, 'binary')
}

Compiler.prototype.lexical = function (code) {
  log.info('lexical')
  return analyse(code)
}

function lookAhead (tokens, index, type, value) {
  if (index > tokens.length - 1) {
    return 0
  }
  var token = tokens[index]
  if (token.type === type) {
    if (value === undefined || token.value.toUpperCase() === value.toUpperCase()) {
      return 1
    }
  }
  return 0
}

function tInstruction (tokens, index) {
  return lookAhead(tokens, index, 'T_INSTRUCTION')
}

function tHexNumber (tokens, index) {
  return lookAhead(tokens, index, 'T_HEX_NUMBER')
}

function tBinaryNumber (tokens, index) {
  return lookAhead(tokens, index, 'T_BINARY_NUMBER')
}

function tNumber (tokens, index) {
  return OR([tHexNumber, tBinaryNumber, tDecimalArgument], tokens, index)
}

function tRelative (tokens, index) {
  if (tInstruction(tokens, index)) {
    var valid = ['BCC', 'BCS', 'BEQ', 'BNE', 'BMI', 'BPL', 'BVC', 'BVS']
    for (var v in valid) {
      if (tokens[index].value.toUpperCase() === valid[v]) {
        return 1
      }
    }
  }
  return 0
}

function tLabel (tokens, index) {
  return lookAhead(tokens, index, 'T_LABEL')
}

function tMarker (tokens, index) {
  return lookAhead(tokens, index, 'T_MARKER')
}

function tAddressOrTBinaryNumberOrTDecimalArgument (tokens, index) {
  return OR([tAddress, tBinaryNumber, tDecimalArgument], tokens, index)
}

function tAddressOrTMarker (tokens, index) {
  return OR([tAddress, tMarker], tokens, index)
}

function tAddress (tokens, index) {
  return lookAhead(tokens, index, 'T_ADDRESS')
}

function tZeropage (tokens, index) {
  if (tAddress(tokens, index) && tokens[index].value.length === 3) {
    return 1
  }
  return 0
}

function tSeparator (tokens, index) {
  return lookAhead(tokens, index, 'T_SEPARATOR', ',')
}

function tAccumulator (tokens, index) {
  return lookAhead(tokens, index, 'T_ACCUMULATOR', 'A')
}

function tRegisterX (tokens, index) {
  return lookAhead(tokens, index, 'T_REGISTER', 'X')
}

function tRegisterY (tokens, index) {
  return lookAhead(tokens, index, 'T_REGISTER', 'Y')
}

function tOpen (tokens, index) {
  return lookAhead(tokens, index, 'T_OPEN', '(')
}

function tClose (tokens, index) {
  return lookAhead(tokens, index, 'T_CLOSE', ')')
}

function tOpenSquareBrackets (tokens, index) {
  return lookAhead(tokens, index, 'T_OPEN_SQUARE_BRACKETS', '[')
}

function tCloseSquareBrackets (tokens, index) {
  return lookAhead(tokens, index, 'T_CLOSE_SQUARE_BRACKETS', ']')
}

function tNesasmCompatibleOpen (tokens, index) {
  return OR([tOpen, tOpenSquareBrackets], tokens, index)
}

function tNesasmCompatibleClose (tokens, index) {
  return OR([tClose, tCloseSquareBrackets], tokens, index)
}

function tEndline (tokens, index) {
  return lookAhead(tokens, index, 'T_ENDLINE', '\n')
}

function OR (args, tokens, index) {
  for (var t in args) {
    if (args[t](tokens, index)) {
      return args[t](tokens, index)
    }
  }
  return 0
}

function tModifier (tokens, index) {
  return lookAhead(tokens, index, 'T_MODIFIER')
}

function tDirective (tokens, index) {
  return lookAhead(tokens, index, 'T_DIRECTIVE')
}

function tDirectiveArgument (tokens, index) {
  return OR([tList, tAddress, tBinaryNumber, tMarker, tDecimalArgument, tString], tokens, index)
}

function tDecimalArgument (tokens, index) {
  return lookAhead(tokens, index, 'T_DECIMAL_ARGUMENT')
}

function tString (tokens, index) {
  return lookAhead(tokens, index, 'T_STRING')
}

function tList (tokens, index) {
  if (tAddressOrTBinaryNumberOrTDecimalArgument(tokens, index) && tSeparator(tokens, index + 1)) {
    var islist = 1
    var arg = 0
    while (islist) {
      islist = islist & tSeparator(tokens, index + (arg * 2) + 1)
      islist = islist & tAddressOrTBinaryNumberOrTDecimalArgument(tokens, index + (arg * 2) + 2)
      if (tEndline(tokens, index + (arg * 2) + 3) || index + (arg * 2) + 3 === tokens.length) {
        break
      }
      arg++
    }
    if (islist) {
      return ((arg + 1) * 2) + 1
    }
  }
  return 0
}

var asm65Bnf = [
  {type: 'S_RS', bnf: [tMarker, tDirective, tDirectiveArgument]},
  {type: 'S_DIRECTIVE', bnf: [tDirective, tDirectiveArgument]},
  {type: 'S_RELATIVE', bnf: [tRelative, tAddressOrTMarker]},
  {type: 'S_IMMEDIATE', bnf: [tInstruction, tNumber]},
  {type: 'S_IMMEDIATE_WITH_MODIFIER', bnf: [tInstruction, tModifier, tOpen, tAddressOrTMarker, tClose]}, // nesasm hack
  {type: 'S_ACCUMULATOR', bnf: [tInstruction, tAccumulator]},
  {type: 'S_ZEROPAGE_X', bnf: [tInstruction, tZeropage, tSeparator, tRegisterX]},
  {type: 'S_ZEROPAGE_Y', bnf: [tInstruction, tZeropage, tSeparator, tRegisterY]},
  {type: 'S_ZEROPAGE', bnf: [tInstruction, tZeropage]},
  {type: 'S_ABSOLUTE_X', bnf: [tInstruction, tAddressOrTMarker, tSeparator, tRegisterX]},
  {type: 'S_ABSOLUTE_Y', bnf: [tInstruction, tAddressOrTMarker, tSeparator, tRegisterY]},
  {type: 'S_ABSOLUTE', bnf: [tInstruction, tAddressOrTMarker]},
  {type: 'S_INDIRECT_X', bnf: [tInstruction, tNesasmCompatibleOpen, tAddressOrTMarker, tSeparator, tRegisterX, tNesasmCompatibleClose]},
  {type: 'S_INDIRECT_Y', bnf: [tInstruction, tNesasmCompatibleOpen, tAddressOrTMarker, tNesasmCompatibleClose, tSeparator, tRegisterY]},
  {type: 'S_IMPLIED', bnf: [tInstruction]}
]

Compiler.prototype.syntax = function (tokens) {
  log.info('syntax')
  var ast = []
  var x = 0
  var labels = []
  var erros = []
  var move = false
  while (x < tokens.length) {
    if (tLabel(tokens, x)) {
      log.info('pushing label ', getValue(tokens[x]))
      labels.push(getValue(tokens[x]))
      x++
    } else if (tEndline(tokens, x)) {
      x++
    } else {
      for (var bnf in asm65Bnf) {
        var leaf = {}
        var lookAhead = 0 // TODO: confusing to have a func and var named this
        move = false
        for (var i in asm65Bnf[bnf].bnf) {
          move = asm65Bnf[bnf].bnf[i](tokens, x + lookAhead)
          if (!move) {
            break
          }
          lookAhead++
        }
        if (move) {
          if (labels.length > 0) {
            leaf.labels = labels
            labels = []
          }
          var size = 0
          lookAhead = 0
          for (var b in asm65Bnf[bnf].bnf) {
            size += asm65Bnf[bnf].bnf[b](tokens, x + lookAhead)
            lookAhead++
          }
          leaf.children = tokens.slice(x, x + size)
          leaf.type = asm65Bnf[bnf].type
          ast.push(leaf)
          x += size
          break
        }
      }
      if (!move) {
        var walk = 0
        while (!tEndline(tokens, x + walk) && x + walk < tokens.length) {
          walk++
        }
        var erro = {}
        erro.type = 'Syntax Error'
        erro.children = tokens.slice(x, x + walk)
        erro.message = 'Invalid syntax'
        erros.push(erro)
        x += walk
      }
    }
  }
  if (erros.length > 0) {
    var e = new Error()
    e.name = 'Syntax Error'
    e.message = 'There were found ' + erros.length + ' erros:\n'
    e.ast = ast
    e.erros = erros
    throw e
  }
  return ast
}

function getValue (token, labels) {
  var m
  if (token.type === 'T_ADDRESS') {
    m = asm65Tokens[1].regex.exec(token.value)
    return parseInt(m[2], 16)
  } else if (token.type === 'T_HEX_NUMBER') {
    m = asm65Tokens[2].regex.exec(token.value)
    return parseInt(m[2], 16)
  } else if (token.type === 'T_BINARY_NUMBER') {
    m = asm65Tokens[3].regex.exec(token.value)
    return parseInt(m[2], 2)
  } else if (token.type === 'T_DECIMAL_ARGUMENT') {
    return parseInt(token.value, 10)
  } else if (token.type === 'T_LABEL') {
    m = asm65Tokens[4].regex.exec(token.value)
    return m[2]
  } else if (token.type === 'T_MARKER') {
    return labels[token.value]
  } else if (token.type === 'T_STRING') {
    return token.value.substr(1, token.value.length - 2)
  }
  throw new Error('Could not get that value')
}

Compiler.prototype.getLabels = function (ast) {
  log.warn('getLabels')
  var labels = {}
  var address = 0
  ast.forEach(function (leaf) {
    if (leaf.type === 'S_DIRECTIVE' && leaf.children[0].value === '.org') {
      address = parseInt(leaf.children[1].value.substr(1), 16)
    }
    if (leaf.labels !== undefined) {
      log.warn('leaf:', leaf)
      labels[leaf.labels[0]] = address
    }
    if (leaf.type !== 'S_DIRECTIVE' && leaf.type !== 'S_RS') {
      log.warn('cpu:', cpu)
      var size = cpu.addressModeDef[leaf.type].size
      address += size
    } else if (leaf.type === 'S_DIRECTIVE' && leaf.children[0].value === '.db') {
      for (var i in leaf.children) {
        if (leaf.children[i].type === 'T_ADDRESS') {
          address++
        }
      }
    } else if (leaf.type === 'S_DIRECTIVE' && leaf.children[0].value === '.incbin') {
      address += 4 * 1024 // TODO check file size
    }
  })
  return labels
}

Compiler.prototype.semantic = function (ast, iNES) {
  log.warn('semantic')
  var cart = new Cartridge()
  log.warn('cart', cart)
  var labels = this.getLabels(ast)
  log.warn('labels', labels)
  // find all labels o the symbol table
  var erros = []
  var erro
  // Translate opcodes
  var address = 0
  ast.forEach(function (leaf) {
    if (leaf.type === 'S_RS') {
      // marker
      labels[leaf.children[0].value] = cart.rs
      cart.rs += getValue(leaf.children[2])
    } else if (leaf.type === 'S_DIRECTIVE') {
      var directive = leaf.children[0].value
      var argument
      if (leaf.children.length === 2) {
        argument = getValue(leaf.children[1], labels)
      } else {
        argument = leaf.children.slice(1, leaf.children.length)
      }
      if (directives.directiveList[directive] !== undefined) {
        directives.directiveList[directive](argument, cart)
      } else {
        erro = {}
        erro.type = 'Unknown Directive'
        erro.leafChildren = leaf.children
        erros.push(erro)
      }
    } else {
      var instruction
      switch (leaf.type) {
        case 'S_IMPLIED':
        case 'S_ACCUMULATOR':
          instruction = leaf.children[0].value
          address = false
          break
        case 'S_RELATIVE':
          instruction = leaf.children[0].value
          address = getValue(leaf.children[1], labels)
          address = 126 + (address - cart.pc)
          if (address === 128) {
            address = 0
          } else if (address < 128) {
            address = address | 128
          } else if (address > 128) {
            address = address & 127
          }
          break
        case 'S_IMMEDIATE_WITH_MODIFIER':
          instruction = leaf.children[0].value
          var modifier = leaf.children[1].value
          address = getValue(leaf.children[3], labels)
          if (modifier === '#LOW') {
            address = (address & 0x00ff)
          } else if (modifier === '#HIGH') {
            address = (address & 0xff00) >> 8
          }
          break
        case 'S_IMMEDIATE':
        case 'S_ZEROPAGE':
        case 'S_ABSOLUTE':
        case 'S_ZEROPAGE_X':
        case 'S_ZEROPAGE_Y':
        case 'S_ABSOLUTE_X':
        case 'S_ABSOLUTE_Y':
          instruction = leaf.children[0].value
          address = getValue(leaf.children[1], labels)
          break
        case 'S_INDIRECT_X':
        case 'S_INDIRECT_Y':
          instruction = leaf.children[0].value
          address = getValue(leaf.children[2], labels)
          break
      }
      var addressMode = cpu.addressModeDef[leaf.type].short
      var opcode = cpu.opcodes[instruction.toUpperCase()][addressMode]
      if (opcode === undefined) {
        erro = {}
        erro.type = 'SEMANTIC ERROR'
        erro.msg = 'invalid opcode'
        erro.sentence = leaf
        erros.push(erro)
      } else if (addressMode === 'sngl' || addressMode === 'acc') {
        cart.appendCode([opcode])
      } else if (cpu.addressModeDef[leaf.type].size === 2) {
        cart.appendCode([opcode, address])
      } else {
        var arg1 = (address & 0x00ff)
        var arg2 = (address & 0xff00) >> 8
        cart.appendCode([opcode, arg1, arg2])
      }
    }
  })
  if (erros.length > 0) {
    var e = new Error()
    e.name = 'Semantic Error'
    e.message = 'Semantic Error Message'
    e.erros = erros
    throw e
  }
  if (iNES) {
    return cart.getInesCode()
  } else {
    return cart.getCode()
  }
}

Compiler.prototype.nesCompiler = function (code) {
  log.info('nesCompiler')
  var tokens
  var erros = []
  try {
    tokens = this.lexical(code)
    log.info(tokens)
  } catch (e) {
    tokens = e.tokens
    erros = erros.concat(e.message)
  }
  var ast
  try {
    ast = this.syntax(tokens)
  } catch (e) {
    ast = e.ast
    erros = erros.concat(e.message)
  }
  var opcodes
  try {
    opcodes = this.semantic(ast, true)
  } catch (e) {
    erros = erros.concat(e.message)
  }
  if (erros.length > 0) {
    log.error('ERROR:', erros)
    throw erros
  } else {
    return String.fromCharCode.apply(undefined, opcodes)
  }
}

module.exports = Compiler
