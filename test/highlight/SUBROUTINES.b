SUBROUTINE SUBROUTINES()
* <- keyword
*          ^ function
*                     ^ punctuation.bracket
*                      ^ punctuation.bracket

CALL TEST()
* <- keyword
*    ^ function
*        ^ punctuation.bracket
*         ^ punctuation.bracket
VAR INTRINSIC.FUNCTION = TEST()
* <- keyword
*                      ^ operator
*                        ^ function
*                            ^ punctuation.bracket
*                             ^ punctuation.bracket

END SUBROUTINE
