module.exports = [
    {type:'T_INSTRUCTION', regex:/^(ADC|AND|ASL|BCC|BCS|BEQ|BIT|BMI|BNE|BPL|BRK|BVC|BVS|CLC|CLD|CLI|CLV|CMP|CPX|CPY|DEC|DEX|DEY|EOR|INC|INX|INY|JMP|JSR|LDA|LDX|LDY|LSR|NOP|ORA|PHA|PHP|PLA|PLP|ROL|ROR|RTI|RTS|SBC|SEC|SED|SEI|STA|STX|STY|TAX|TAY|TSX|TXA|TXS|TYA)[ \n\t\r]{1}/i, store:true},
    {type:'T_ADDRESS', regex:/^(\$([\dA-F]{1,4}))/, store:true},
    {type:'T_HEX_NUMBER', regex:/^(\#\$?([\dA-F]{2}))/, store:true},
    {type:'T_BINARY_NUMBER', regex:/^(\#?%([01]{8}))/, store:true},
    {type:'T_LABEL', regex:/^(\.?([a-zA-Z]{2}[\_a-zA-Z\d]*)\:)/, store:true},
    {type:'T_MARKER', regex:/^([a-zA-Z]{2}[\_a-zA-Z\d]*)/, store:true},
    {type:'T_STRING', regex:/^("[^"]*")/, store:true},
    {type:'T_SEPARATOR', regex:/^(,)/, store:true},
    {type:'T_ACCUMULATOR', regex:/^(A|a)/, store:true},
    {type:'T_REGISTER', regex:/^(X|x|Y|y)/, store:true},
    {type:'T_MODIFIER', regex:/^(#LOW|#HIGH)/, store:true},
    {type:'T_OPEN', regex:/^(\()/, store:true},
    {type:'T_CLOSE', regex:/^(\))/, store:true},
    {type:'T_OPEN_SQUARE_BRACKETS', regex:/^(\[)/, store:true},
    {type:'T_CLOSE_SQUARE_BRACKETS', regex:/^(\])/, store:true},
    {type:'T_DIRECTIVE', regex:/^(\.[a-z\_]+)/, store:true},
    {type:'T_DECIMAL_ARGUMENT', regex:/^([\d]+)/, store:true}, //TODO change to DECIMAL ARGUMENT
    {type:'T_ENDLINE', regex:/^(\n)/, store:true},
    {type:'T_WHITESPACE', regex:/^([ \t\r]+)/, store:false},
    {type:'T_COMMENT', regex:/^(;[^\n]*)/, store:false}
];

