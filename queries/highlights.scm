((string) @string)
((comment) @comment)
((number) @number)
(equate_statement equate: (identifier) @constant)

; -- Function

(program_definition name: (identifier) @function)
(subroutine_definition name: (identifier) @function)
(call_subroutine_statement name: (identifier) @function)
(goto_statement name: (identifier) @function)
(intrinsic_function name: (identifier) @function)

; -- Operator

(binary_expression operator: (identifier) @operator)
(unary_expression operator: (identifier) @operator)

[
 "="
 "+="
 "-="
 ":="
] @operator

; -- Punctuation

[
 "("
 ")"
 "<"
 ">"
 "["
 "]"
] @punctuation.bracket

[
 ","
] @punctuation.delimiter

; -- Keywords

[
  "program"
  "PROGRAM"
  "subroutine"
  "SUBROUTINE"
  "function"
  "FUNCTION"
  "in"
  "IN"
  "out"
  "OUT"
  "in out"
  "IN OUT"
  "end"
  "END"
  "return"
  "RETURN"
  "var"
  "VAR"
  "if"
  "IF"
  "then"
  "THEN"
  "else"
  "ELSE"
  "call"
  "CALL"
  "goto"
  "GOTO"
  "equ"
  "EQU"
  "gosub"
  "GOSUB"
  "select"
  "SELECT"
  "otherwise"
  "OTHERWISE"
  "begin"
  "BEGIN"
  "case"
  "CASE"
  "when"
  "WHEN"
  "match"
  "MATCH"
  "matches"
  "MATCHES"
  "locate"
  "LOCATE"
  "setting"
  "SETTING"
  "loop"
  "LOOP"
  "until"
  "UNTIL"
  "while"
  "WHILE"
  "do"
  "DO"
  "repeat"
  "REPEAT"
  "for"
  "FOR"
  "to"
  "TO"
  "step"
  "STEP"
  "next"
  "NEXT"
  "readnext"
  "READNEXT"
  "from"
  "FROM"
  "clearselect"
  "CLEARSELECT"
  "continue"
  "CONTINUE"
  "exit"
  "EXIT"
  "del"
  "DEL"
  "abort"
  "ABORT"
  "stop"
  "STOP"
  "mat"
  "MAT"
  "matparse"
  "MATPARSE"
  "printer"
  "PRINTER"
  "on"
  "ON"
  "off"
  "OFF"
  "print"
  "PRINT"
  "input"
  "INPUT"
] @keyword
