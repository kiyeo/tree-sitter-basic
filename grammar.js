
const PREC = {
  DEFAULT: 0,
  LOGICAL_OR: 1,
  LOGICAL_AND: 2,
  EQUAL: 6,
  RELATIONAL: 7,
  ADD: 10,
  MULTIPLY: 11,
  UNARY: 14,
  POWER: 15,
  CALL: 16,
  SUBSCRIPT: 17,
};

module.exports = grammar({
  name: 'basic',

  extras: $ => [
    $.comment,
    /[\s\f\uFEFF\u2060\u200B]|\r?\n/,
    $.line_continuation,
  ],

  conflicts: $ => [
    [$._expression],
    [$.inline_block],
    [$.inline_if_statement],
    [$.for_readnext_statement],
    [$._simple_statements],
    // caused by label_statement.
    // [$._suite],
    // [$.block],
  ],
  externals: $ => [
    $._string_start,
    $._string_end,
    '\n',
    $._subscript_start,
    $._subscript_close,
    $._less_than,
    $._greater_than,
    $._less_than_equal,
    $._greater_than_equal,
    $._arrow,
    $._disambiguate_label,
    $._label_colon,
    $.error_sentinel,
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => seq(
      repeat(
        $._statement,
      ),
    ),

    _statement: $ => choice(
      $.program_definition,
      $.subroutine_definition,
      $.function_definition,
      $._simple_statements,
      // $.library
      // TODO: other kinds of definitions
    ),

    program_definition: $ => seq(
      choice('program', 'PROGRAM'),
      field('name', $.identifier),
      field('body', $._suite),
      choice(
        seq('end', 'program'),
        seq('END', 'PROGRAM'),
      ),
    ),

    subroutine_definition: $ => seq(
      choice('subroutine', 'SUBROUTINE'),
      field('name', $.identifier),
      optional(field('parameters', $.parameter_list)),
      field('body', $._suite),
      choice(
        seq('end', 'subroutine'),
        seq('END', 'SUBROUTINE'),
      ),
    ),

    function_definition: $ => seq(
      choice('function', 'FUNCTION'),
      field('name', $.identifier),
      field('body', $._suite),
      choice(
        seq('end', 'function'),
        seq('END', 'FUNCTION'),
      ),
    ),

    _conditional_statement: $ => choice(
      $.if_statement,
      $.inline_if_statement,
      $.begin_case_statement,
      $.begin_select_statement,
    ),

    if_statement: $ => seq(
      choice('if', 'IF'),
      field('condition', $._expression),
      choice('then', 'THEN'),
      field('body', $._suite),
      repeat(field('alternative', $.else_if_clause)),
      optional(field('alternative', $.else_clause)),
      choice('end', 'END'),
    ),

    inline_if_statement: $ => seq(
      choice('if', 'IF'),
      field('condition', $._expression),
      choice('then', 'THEN'),
      field('body', $.inline_block),
      optional(choice('end', 'END')),
    ),

    else_if_clause: $ => seq(
      choice(
        seq('end', 'else', 'if'),
        seq('END', 'ELSE', 'IF'),
      ),
      field('condition', $._expression),
      choice('then', 'THEN'),
      field('body', $._suite),
    ),

    else_clause: $ => seq(
      choice(
        seq('end', 'else'),
        seq('END', 'ELSE'),
      ),
      field('body', $._suite),
    ),

    begin_case_statement: $ => seq(
      choice(
        seq('begin', 'case'),
        seq('BEGIN', 'CASE'),
      ),
      '\n',
      repeat($.case_clause),
      choice(
        seq('end', 'case'),
        seq('END', 'CASE'),
      ),
    ),

    case_clause: $ => seq(
      choice('case', 'CASE'),
      $._expression,
      optional(field('body', $._suite)),
    ),

    begin_select_statement: $ => seq(
      choice(
        seq('begin', 'select'),
        seq('BEGIN', 'SELECT'),
      ),
      $._expression,
      repeat($.when_clause),
      optional($.otherwise_clause),
      choice(
        seq('end', 'select'),
        seq('END', 'SELECT'),
      ),
    ),

    when_clause: $ => seq(
      choice('when', 'WHEN'),
      seq($._expression, repeat(seq(',', $._expression))),
      field('body', $._suite),
    ),

    otherwise_clause: $ => seq(
      choice('otherwise', 'OTHERWISE'),
      field('body', $._suite),
    ),

    parameter_list: $ => seq(
      '(',
      optional(
        seq(
          choice(
            optional(choice('in', 'out', 'in out')),
            optional(choice('IN', 'OUT', 'IN OUT')),
          ),
          $._identifier,
          repeat(
            seq(',',
              choice(
                optional(choice('in', 'out', 'in out')),
                optional(choice('IN', 'OUT', 'IN OUT')),
              ),
              $._identifier,
            ),
          ),
        ),
      ),
      optional(','),
      ')',
    ),

    _suite: $ => choice(
      '\n',
      seq(
        '\n',
        $.block,
      ),
    ),

    block: $ => repeat1(
      $._simple_statements,
    ),

    inline_block: $ => seq(
      $._simple_statement, repeat(seq(optional(';'), $._simple_statement)),
      optional(';'),
    ),

    // STATEMENTS

    _simple_statements: $ => seq(
      $._simple_statement, repeat(seq(optional(';'), $._simple_statement)),
      optional(';'),
      optional('\n'),
    ),

    _simple_statement: $ => choice(
      $._variable_statement,
      $._subroutine_call_statement,
      $.return_statement,
      $._conditional_statement,
      $.equate_statement,
      $.locate_statement,
      $.for_statement,
      $.for_readnext_statement,
      $.loop_statement,
      $.readnext_statement,
      $.label_statement,
      $.crt_statement,
      $.exit_statement,
      $.stop_statement,
      $.continue_statement,
      $.clearselect_statement,
      $.del_statement,
      $.abort_statement,
      $.mat_statement,
      $.matparse_statement,
      $.printer_statement,
      $.print_statement,
      $.input_statement,
      // TODO: other kinds of statements
    ),

    _variable_statement: $ => choice(
      $.variable_initialisation,
      $.variable_assignment,
    ),

    variable_initialisation: $ => seq(
      choice('var', 'VAR'),
      choice(
        field('variable', $._identifier),
        $.mat_statement,
      ),
    ),

    variable_assignment: $ => seq(
      field('variable',
        choice(
          alias($.variable_initialisation, 'identifier'),
          $.identifier,
          seq(
            field('name', $.identifier),
            alias($._subscript_start, '<'),
            $._expression,
            repeat(seq(',', $._expression)),
            alias($._subscript_close, '>'),
          ),
        ),
      ),
      // $._disambiguate_label,
      field('operator', choice('=', '+=', '-=', ':=')),
      $._expression,
    ),

    _subroutine_call_statement: $ => choice(
      $.goto_statement,
      $.on_goto_statement,
      $.gosub_statement,
      $.on_gosub_statement,
      $.call_subroutine_statement,
    ),

    goto_statement: $ => seq(
      choice('goto', 'GOTO'),
      field('name', $._identifier),
    ),

    on_goto_statement: $ => seq(
      choice('on', 'ON'),
      field('expression', $._expression),
      choice('goto', 'GOTO'),
      $._identifier,
      repeat(seq(',', $._identifier)),
    ),

    gosub_statement: $ => seq(
      choice('gosub', 'GOSUB'),
      $._identifier,
    ),

    on_gosub_statement: $ => seq(
      choice('on', 'ON'),
      field('expression', $._expression),
      choice('gosub', 'GOSUB'),
      $._identifier,
      repeat(seq(',', $._identifier)),
    ),

    call_subroutine_statement: $ => seq(
      choice('call', 'CALL'),
      field('name', $._identifier),
      '(',
      seq(
        $._expression,
        repeat(seq(',', $._expression)),
      ),
      ')',
    ),

    equate_statement: $ => seq(
      choice('equ', 'EQU'),
      field('equate', $._identifier),
      'TO',
      field('value', choice(
        $.string,
        $._identifier,
        $.char,
      ),
      ),
    ),

    return_statement: $ => prec.right(1, seq(
      choice('return', 'RETURN'),
      optional($._expression),
    )),

    locate_statement: $ => seq(
      choice('locate', 'LOCATE'),
      field('string', $._expression),
      choice('in', 'IN'),
      field('array', $._expression),
      optional(
        seq(
          choice('by', 'BY'),
          field('seq', $._expression),
        ),
      ),
      choice('setting', 'SETTING'),
      choice(
        $.variable_initialisation,
        field('variable', $._identifier),
      ),
      choice(choice('then', 'THEN'), choice('else', 'ELSE')),
      field('body', $._suite),
      optional(field('alternative', $.else_clause)),
      choice('end', 'END'),
    ),

    for_statement: $ => seq(
      choice('for', 'FOR'),
      $._variable_statement,
      choice('to', 'TO'),
      $._expression,
      optional(
        seq(
          choice('step', 'STEP'),
          $._expression,
        ),
      ),
      field('body', $._suite),
      choice('next', 'NEXT'),
      $._expression,
    ),

    for_readnext_statement: $ => seq(
      choice('for', 'FOR'),
      choice('readnext', 'READNEXT'),
      choice($._variable_statement, $._identifier),
      optional(
        seq(',',
          choice($._variable_statement, $._identifier)),
      ),
      choice('from', 'FROM'),
      $._expression,
      field('body', $._suite),
      choice('next', 'NEXT'),
      optional(
        seq(
          $._identifier,
          optional(
            seq(',', $._identifier),
          ),
        ),
      ),
    ),

    loop_statement: $ => seq(
      choice('loop', 'LOOP'),
      field('body', $._suite),
      choice(
        choice('until', 'UNTIL'),
        choice('while', 'WHILE'),
      ),
      $._expression,
      optional(choice('do', 'DO')),
      field('body', $._suite),
      choice('repeat', 'REPEAT'),
    ),

    label_statement: $ => seq(
      choice(
        seq(alias(/[0-9]+/, $.number), optional(':')),
        /[a-zA-Z0-9]+:[^=]/,
      ),
      // field("body", $._suite), // Chose to not give it a body node as there is no anchoring token because RETURN is optional
      // "RETURN"
    ),

    crt_statement: $ => seq(
      choice('crt', 'CRT'),
      $._expression,
    ),

    exit_statement: $ => choice('exit', 'EXIT'),

    stop_statement: $ => choice('stop', 'STOP'),

    continue_statement: $ => choice('continue', 'CONTINUE'),

    del_statement: $ => seq(
      choice('del', 'DEL'),
      $._expression,
    ),

    abort_statement: $ => seq(
      choice('abort', 'ABORT'),
      $._expression,
    ),

    mat_statement: $ => seq(
      choice('mat', 'MAT'),
      $.identifier,
    ),

    matparse_statement: $ => seq(
      choice('matparse', 'MATPARSE'),
      $._expression,
      choice('from', 'FROM'),
      $._expression,
    ),

    readnext_statement: $ => seq(
      choice('readnext', 'READNEXT'),
      choice(
        $.identifier,
        $._variable_statement,
      ),
      optional(
        seq(',',
          choice(
            $.identifier,
            $._variable_statement,
          ),
        ),
      ),
      choice('from', 'FROM'),
      $._expression,
      choice(
        seq(
          choice(choice('then', 'THEN'), choice('else', 'ELSE')),
          $.inline_block,
        ),
        seq(
          field('body', $._suite),
          choice('end', 'END'),
        ),
      ),
    ),

    clearselect_statement: $ => seq(
      choice('clearselect', 'CLEARSELECT'),
      $._expression,
    ),

    printer_statement: $ => seq(
      choice('printer', 'PRINTER'),
      choice(choice('on', 'ON'), choice('off', 'OFF')),
    ),

    print_statement: $ => prec.right(2, seq(
      choice('print', 'PRINT'),
      optional(seq(choice('on', 'ON'), $.number)),
      $._expression,
      repeat(seq(',', $._expression)),
      optional(':'),
    )),

    input_statement: $ => prec.right(2, seq(
      choice('input', 'INPUT'),
      field('variable',
        seq(
          $.identifier,
          optional(field('expression', seq('=', $._expression))),
        ),
      ),
      optional(seq(',', $._expression)),
      optional(seq(',', $._expression)),
      optional('_'),
      optional(':'),
      optional(seq(choice('from', 'FROM'), $._expression)),
    )),

    // EXPRESSION

    _expression: $ => seq(
      optional('('),
      choice(
        $.unary_expression,
        $.subscript,
        $.binary_expression,
        $.match_expression,
        $.concatenate_operator,
        $.intrinsic_function,
        $.string,
        $._identifier,
        $.variable_initialisation,
        $.char,
      ),
      optional(seq(
        '[',
        $._expression,
        ',',
        $._expression,
        ']',
      )),
      optional(')'),
    ),

    unary_expression: $ => {
      const table = [
        ['-', PREC.UNARY],
        ['+', PREC.UNARY],
      ];
      return choice(...table.map(([operator, precedence]) => {
        return prec(precedence, seq(
          field('operator', alias(operator, $.identifier)),
          field('right', $._expression),
        ));
      }));
    },

    binary_expression: $ => {
      const table = [
        ['+', PREC.ADD],
        ['-', PREC.ADD],
        ['*', PREC.MULTIPLY],
        ['/', PREC.MULTIPLY],
        [choice('or', 'OR'), PREC.LOGICAL_OR],
        [choice('and', 'AND'), PREC.LOGICAL_AND],
        ['**', PREC.POWER],
        ['^', PREC.POWER],
        ['=', PREC.EQUAL],
        [choice('eq', 'EQ'), PREC.EQUAL],
        ['#', PREC.EQUAL],
        [choice('ne', 'NE'), PREC.EQUAL],
        [alias($._greater_than, '>'), PREC.RELATIONAL],
        [choice('gt', 'GT'), PREC.RELATIONAL],
        [alias($._greater_than_equal, '>='), PREC.RELATIONAL],
        [choice('ge', 'GE'), PREC.RELATIONAL],
        [alias($._less_than_equal, '<='), PREC.RELATIONAL],
        [choice('le', 'LE'), PREC.RELATIONAL],
        [alias($._less_than, '<'), PREC.RELATIONAL],
        [choice('lt', 'LT'), PREC.RELATIONAL],
      ];

      return choice(...table.map(([operator, precedence]) => {
        return prec.left(precedence, seq(
          field('left', $._expression),
          field('operator', alias(operator, $.identifier)),
          field('right', $._expression),
        ));
      }));
    },

    match_expression: $ => seq(
      $._identifier,
      choice(
        choice('match', 'MATCH'),
        choice('matches', 'MATCHES'),
      ),
      choice(
        $._identifier,
        $.string,
      ),
    ),

    concatenate_operator: $ => choice(
      prec.left(1, seq(
        $._expression,
        repeat1(seq(':', $._expression)),
      )),
      prec.left(1, seq(
        $._expression,
        repeat1(seq(choice('cat', 'CAT'), $._expression)),
      )),
    ),

    subscript: $ => seq(
      field('variable', $._identifier),
      alias($._subscript_start, '<'),
      seq(
        $._expression,
        repeat(seq(',', $._expression)),
      ),
      alias($._subscript_close, '>'),
    ),

    intrinsic_function: $ => seq(
      field('name', $._identifier),
      '(',
      optional(field('argument',
        seq(
          $._expression,
          repeat(seq(',', $._expression)),
        ),
      )),
      ')',
    ),

    json_expression: $ => seq(
      field('name', $._identifier),
      repeat1(
        seq(
          '{',
          field('argument', $._expression),
          '}',
        ),
      ),
    ),

    char: $ => seq(
      field('name', choice('char', 'CHAR')),
      '(',
      field('argument', $.number),
      ')',
    ),

    string: $ => seq(
      $._string_start,
      optional($._identifier),
      $._string_end,
    ),

    _identifier: $ => choice(
      $.number,
      $.identifier,
    ),

    number: $ => /([0-9]*[.])?[0-9]+/,
    identifier: $ => /[0-9A-Za-z\.$@_]+/,

    comment: _ => token(choice(
      seq('*', /.*/),
      seq(';', /\s*\*.*/),
    )),

    line_continuation: _ => token(seq('|', choice(seq(optional('\r'), '\n'), '\0'))),
  },
});
