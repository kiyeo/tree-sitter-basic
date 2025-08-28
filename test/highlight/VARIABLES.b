PROGRAM VARIABLES

VAR A = 'STRING'
* <- keyword
*     ^ operator
*       ^ string
VAR B = "STRING"
* <- keyword
*     ^ operator
*       ^ string
VAR C = \STRING\:1
* <- keyword
*     ^ operator
*       ^ string
*                ^ number
VAR D=A ; VAR C = 'a'
* <- keyword
*    ^ operator
*         ^ keyword
*               ^ operator
*                 ^ string

END PROGRAM
