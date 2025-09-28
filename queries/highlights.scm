((string) @string)
((comment) @comment)
((number) @number)
(equate_statement name: (identifier) @constant)

; -- Variable

(variable_initialisation name: (identifier) @variable)
(variable_assignment left: (identifier) @variable)

; -- Function

(program_definition name: (identifier) @function)
(subroutine_definition name: (identifier) @function)
(call_subroutine_statement name: (identifier) @function)
(goto_statement name: (identifier) @function)
(parentheses_expression name: (identifier) @function)

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
  "$INCLUDE"
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
  "equate"
  "EQUATE"
  "lit"
  "LIT"
  "literally"
  "LITERALLY"
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
  "read"
  "READ"
  "readu"
  "READU"
  "error"
  "ERROR"
  "locked"
  "LOCKED"
  "next"
  "write"
  "WRITE"
  "writeu"
  "WRITEU"
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
  "dim"
  "DIM"
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
  "crt"
  "CRT"
  "input"
  "INPUT"
  "ins"
  "INS"
  "before"
  "BEFORE"
  "convert"
  "CONVERT"
  "execute"
  "EXECUTE"
  "rtnlist"
  "RTNLIST"
  "capturing"
  "CAPTURING"
  "null"
  "NULL"
] @keyword
