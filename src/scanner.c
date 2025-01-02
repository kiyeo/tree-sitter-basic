#include "tree_sitter/array.h"
#include "tree_sitter/parser.h"

enum TokenType {
  STRING_START,
  STRING_END,
  DISAMBIGUATE_SUBSCRIPT,
  SUBSCRIPT_START,
  SUBSCRIPT_CLOSE,
  LESS_THAN,
  GREATER_THAN,
  LESS_THAN_EQUAL,
  GREATER_THAN_EQUAL,
  ARROW,
  LABEL_COLON,
  //  A sentinel value used to signal an error has occurred already.
  //  https://tree-sitter.github.io/tree-sitter/creating-parsers#other-external-scanner-details
  ERROR
};

typedef enum {
  SingleQuote = 1 << 0,
  DoubleQuote = 1 << 1,
  BackSlash = 1 << 2,
} Flags;

typedef struct {
  char flags;
} Delimiter;

typedef struct {
  Array(bool) items;
  int rear;
  int front;
} Queue;

// Function to initialize the queue
void initializeQueue(Queue *q) {
  q->front = -1;
  q->rear = 0;
}

// Function to check if the queue is empty
bool isEmpty(Queue *q) { return (q->front == q->rear - 1); }

// Function to check if the queue is full
bool isFull(Queue *q) { return (q->rear == 1024); }

// Function to add an element to the queue (Enqueue
// operation)
void enqueue(Queue *q, int value) {
  if (isFull(q)) {
    printf("Queue is full\n");
    return;
  }
  array_push(&q->items, value);
  q->rear++;
}

// Function to add an element to the queue (Enqueue
// operation)
void enqueue_test(Queue *q) {
  if (isFull(q)) {
    printf("Queue is full\n");
    return;
  }
  q->rear++;
}

// Function to remove an element from the queue (Dequeue
// operation)
bool dequeue(Queue *q) {
  if (isEmpty(q)) {
    printf("Queue is empty\n");
    return false;
  }
  q->front++;
  return q->items.contents[q->front];
}

// Function to get the element at the front of the queue
// (Peek operation)
bool peek(Queue *q) {
  if (isEmpty(q)) {
    printf("Queue is empty\n");
    return -1; // return some default value or handle
               // error differently
  }
  return q->items.contents[q->front + 1];
}

typedef struct {
  Queue is_lt_subscript_queue;
  Queue is_gt_subscript_queue;
  Array(Delimiter) delimiters;
} Scanner;

static inline int32_t end_string(Delimiter *delimiter) {
  if (delimiter->flags & SingleQuote) {
    return '\'';
  }
  if (delimiter->flags & DoubleQuote) {
    return '"';
  }
  if (delimiter->flags & BackSlash) {
    return '\\';
  }
  return 0;
}

// Create the array in your create function

void *tree_sitter_basic_external_scanner_create() {
  Scanner *scanner = ts_calloc(1, sizeof(Scanner));
  array_init(&scanner->is_lt_subscript_queue.items);
  initializeQueue(&scanner->is_lt_subscript_queue);
  array_init(&scanner->is_gt_subscript_queue.items);
  initializeQueue(&scanner->is_gt_subscript_queue);
  array_init(&scanner->delimiters);
  return scanner;
}

void tree_sitter_basic_external_scanner_destroy(void *payload) {
  Scanner *scanner = (Scanner *)payload;
  array_delete(&scanner->is_lt_subscript_queue.items);
  array_delete(&scanner->is_gt_subscript_queue.items);
  array_delete(&scanner->delimiters);
  ts_free(scanner);
}

unsigned tree_sitter_basic_external_scanner_serialize(void *payload,
                                                      char *buffer) {
  Scanner *scanner = (Scanner *)payload;
  unsigned size = 0;
  uint32_t delimiter_size = scanner->delimiters.size;
  if (delimiter_size > UINT8_MAX) {
    delimiter_size = UINT8_MAX;
  }
  buffer[size++] = (char)delimiter_size;
  if (delimiter_size > 0) {
    memcpy(&buffer[size], scanner->delimiters.contents, delimiter_size);
  }
  size += delimiter_size;

  buffer[size++] = (char)scanner->is_lt_subscript_queue.front;
  buffer[size++] = (char)scanner->is_lt_subscript_queue.rear;
  uint32_t less_than_size = scanner->is_lt_subscript_queue.items.size;
  if (less_than_size > UINT8_MAX) {
    less_than_size = UINT8_MAX;
  }
  buffer[size++] = less_than_size;
  if (less_than_size > 0) {
    memcpy(&buffer[size], scanner->is_lt_subscript_queue.items.contents,
           less_than_size);
  }
  size += less_than_size;

  buffer[size++] = (char)scanner->is_gt_subscript_queue.front;
  buffer[size++] = (char)scanner->is_gt_subscript_queue.rear;
  uint32_t greater_than_size = scanner->is_gt_subscript_queue.items.size;
  if (greater_than_size > UINT8_MAX) {
    greater_than_size = UINT8_MAX;
  }
  buffer[size++] = greater_than_size;
  if (greater_than_size > 0) {
    memcpy(&buffer[size], scanner->is_gt_subscript_queue.items.contents,
           greater_than_size);
  }
  size += greater_than_size;

  assert(size < TREE_SITTER_SERIALIZATION_BUFFER_SIZE);

  /* printf("serialize - delimiters: %zu less_than_count: %u greater_than_count:
     "
         "%u\n",
         delimiter_count, less_than_size, greater_than_size); */

  return size;
}

void tree_sitter_basic_external_scanner_deserialize(void *payload,
                                                    const char *buffer,
                                                    unsigned length) {
  Scanner *scanner = (Scanner *)payload;
  array_clear(&scanner->delimiters);
  array_clear(&scanner->is_lt_subscript_queue.items);
  array_clear(&scanner->is_gt_subscript_queue.items);

  if (length > 0) {
    size_t size = 0;
    uint8_t delimiter_size = buffer[size++];
    if (delimiter_size > 0) {
      array_reserve(&scanner->delimiters, delimiter_size);
      scanner->delimiters.size = delimiter_size;
      memcpy(scanner->delimiters.contents, &buffer[size], delimiter_size);
      size += delimiter_size;
    }

    scanner->is_lt_subscript_queue.front = (int)buffer[size++];
    scanner->is_lt_subscript_queue.rear = (int)buffer[size++];
    uint8_t less_than_size = buffer[size++];
    if (less_than_size > 0) {
      array_reserve(&scanner->is_lt_subscript_queue.items, less_than_size);
      scanner->is_lt_subscript_queue.items.size = less_than_size;
      memcpy(scanner->is_lt_subscript_queue.items.contents, &buffer[size],
             less_than_size);
      size += less_than_size;
    }

    scanner->is_gt_subscript_queue.front = (int)buffer[size++];
    scanner->is_gt_subscript_queue.rear = (int)buffer[size++];
    uint8_t greater_than_size = buffer[size++];
    if (greater_than_size > 0) {
      array_reserve(&scanner->is_gt_subscript_queue.items, greater_than_size);
      scanner->is_gt_subscript_queue.items.size = greater_than_size;
      memcpy(scanner->is_gt_subscript_queue.items.contents, &buffer[size],
             greater_than_size);
      size += greater_than_size;
    }

    /* printf("deserialize - delimiters: %zu less_than_count: %u
       greater_than_count: %u\n", delimiter_count, less_than_size,
       greater_than_size); */
  }
}

static bool parse_subscript(Scanner *scanner, TSLexer *lexer,
                            const bool *valid_symbols) {
  // LIMITATION: statements with templates/subscripts must be on line 2 or
  // more
  if (valid_symbols[DISAMBIGUATE_SUBSCRIPT] && lexer->lookahead == '\n') {
    array_clear(&scanner->is_lt_subscript_queue.items);
    initializeQueue(&scanner->is_lt_subscript_queue);
    array_clear(&scanner->is_gt_subscript_queue.items);
    initializeQueue(&scanner->is_gt_subscript_queue);

    lexer->mark_end(lexer);
    lexer->result_symbol = DISAMBIGUATE_SUBSCRIPT;

    // we skip continous new lines
    while (lexer->lookahead == '\n') {
      // printf("%c", lexer->lookahead);
      lexer->advance(lexer, false);
    }

    uint32_t expr_depth = 0;
    bool is_comment = false;

    while (lexer->lookahead != '<' && !lexer->eof(lexer) &&
           lexer->lookahead != '\n') {
      // printf("%c", lexer->lookahead);
      //           skip comment
      if (lexer->lookahead == '*') {
        is_comment = true;
        while (is_comment) {
          lexer->advance(lexer, false);
          if (lexer->lookahead == '\n') {
            is_comment = false;
          }
        }
      }

      if (lexer->lookahead == '(') {
        expr_depth++;
      }
      if (lexer->lookahead == ')') {
        expr_depth--;
      }
      if (lexer->lookahead == '>') {
        // we default to greater than
        enqueue(&scanner->is_gt_subscript_queue, false);
      }
      // check continous line and consume new line so that we don't terminate
      // while loop condition
      if (lexer->lookahead == '|') {
        lexer->advance(lexer, false);
        if (lexer->lookahead == '\n') {
          lexer->advance(lexer, false);
          continue;
        }
      }
      lexer->advance(lexer, false);
    }

    if (lexer->lookahead == '<') {
      if (isEmpty(&scanner->is_lt_subscript_queue)) {
        lexer->advance(lexer, false);

        // A stack of '<' tokens.
        // Used to pair '<' and '>' tokens at the same expression depth.
        typedef struct {
          uint32_t index; // Index of the opening '>' in is_lt_subscript_queue
          uint32_t expr_depth; // The value of 'expr_depth' for the opening '<'
        } StackEntry;

        Array(StackEntry) lt_stack = array_new();

        array_push(&lt_stack,
                   ((StackEntry){scanner->is_lt_subscript_queue.items.size,
                                 expr_depth}));
        // we default to less than
        enqueue(&scanner->is_lt_subscript_queue, false);

        while (lt_stack.size > 0 || lexer->lookahead != '\n') {
          // check continous line and consume new line so that we don't
          // terminate while loop condition
          if (lexer->lookahead == '|') {
            lexer->advance(lexer, false);
            if (lexer->lookahead == '\n') {
              lexer->advance(lexer, false);
              continue;
            }
          }
          if (lexer->lookahead == '\n') {
            array_pop(&lt_stack);
          }
          if (lexer->eof(lexer)) {
            array_pop(&lt_stack);
          }

          // skip comment
          if (lexer->lookahead == '*') {
            is_comment = true;
            while (is_comment) {
              lexer->advance(lexer, false);
              if (lexer->lookahead == '\n') {
                is_comment = false;
              }
            }
          }

          if (lexer->lookahead == '(') {
            expr_depth++;
            lexer->advance(lexer, false);
            continue;
          }
          if (lexer->lookahead == ')') {
            // Exiting a nested expression
            // Pop the stack until we return to the current expression
            // expr_depth
            while (lt_stack.size > 0 &&
                   array_back(&lt_stack)->expr_depth == expr_depth) {
              array_pop(&lt_stack);
            }
            if (expr_depth > 0) {
              expr_depth--;
            }
            lexer->advance(lexer, false);
            continue;
          }
          if (lexer->lookahead == '<') {
            lexer->advance(lexer, false);
            array_push(&lt_stack,
                       ((StackEntry){scanner->is_lt_subscript_queue.items.size,
                                     expr_depth}));
            enqueue(&scanner->is_lt_subscript_queue, false);
            continue;
          }

          if (lexer->lookahead == '>') {
            lexer->advance(lexer, false);
            // less than stack is not empty, is in the same expression depth
            if (lt_stack.size > 0 &&
                array_back(&lt_stack)->expr_depth == expr_depth) {
              scanner->is_lt_subscript_queue.items
                  .contents[array_back(&lt_stack)->index] = true;
              enqueue(&scanner->is_gt_subscript_queue, true);
              array_pop(&lt_stack);
            } else {
              enqueue(&scanner->is_gt_subscript_queue, false);
            }
            continue;
          }

          lexer->advance(lexer, false);
        }
      }
    }
    return true;
  }

  if (valid_symbols[SUBSCRIPT_START] || valid_symbols[SUBSCRIPT_CLOSE] ||
      valid_symbols[LESS_THAN_EQUAL] || valid_symbols[GREATER_THAN_EQUAL] ||
      valid_symbols[LESS_THAN] || valid_symbols[GREATER_THAN] ||
      valid_symbols[ARROW]) {

    lexer->mark_end(lexer);
    while (lexer->lookahead == ' ') {
      lexer->advance(lexer, false);
    }

    if (lexer->lookahead == '-') {
      lexer->advance(lexer, false);
      if (lexer->lookahead == '>') {
        dequeue(&scanner->is_gt_subscript_queue);
        lexer->advance(lexer, false);
        lexer->mark_end(lexer);
        lexer->result_symbol = ARROW;
        return true;
      }
    }

    if (lexer->lookahead == '<') {
      lexer->advance(lexer, false);
      if (!isEmpty(&scanner->is_lt_subscript_queue) &&
          dequeue(&scanner->is_lt_subscript_queue)) {
        lexer->mark_end(lexer);
        lexer->result_symbol = SUBSCRIPT_START;
        return true;
      }
      if (lexer->lookahead == '=') {
        lexer->advance(lexer, false);
        lexer->mark_end(lexer);
        lexer->result_symbol = LESS_THAN_EQUAL;
        return true;
      }
      lexer->mark_end(lexer);
      lexer->result_symbol = LESS_THAN;
      return true;
    }

    if (lexer->lookahead == '>') {
      lexer->advance(lexer, false);
      if (!isEmpty(&scanner->is_gt_subscript_queue) &&
          dequeue(&scanner->is_gt_subscript_queue)) {
        lexer->mark_end(lexer);
        lexer->result_symbol = SUBSCRIPT_CLOSE;
        return true;
      }
      if (lexer->lookahead == '=') {
        lexer->advance(lexer, false);
        lexer->mark_end(lexer);
        lexer->result_symbol = GREATER_THAN_EQUAL;
        return true;
      }
      lexer->mark_end(lexer);
      lexer->result_symbol = GREATER_THAN;
      return true;
    }
  }

  return false;
}

static bool parse_string(Scanner *scanner, TSLexer *lexer,
                         const bool *valid_symbols) {

  if (valid_symbols[STRING_END] && scanner->delimiters.size > 0) {
    Delimiter *delimiter = array_back(&scanner->delimiters);
    int32_t end_str = end_string(delimiter);

    while (lexer->lookahead) {
      if (lexer->lookahead == end_str) {
        array_pop(&scanner->delimiters);
        lexer->advance(lexer, false);
        lexer->result_symbol = STRING_END;
        return true;
      } else {
        lexer->advance(lexer, true);
      }
    }
  }

  if (valid_symbols[STRING_START]) {
    Delimiter delimiter = (Delimiter){0};

    lexer->mark_end(lexer);
    while (lexer->lookahead == ' ') {
      lexer->advance(lexer, true);
    }

    if (lexer->lookahead == '\\') {
      delimiter.flags |= BackSlash;
      array_push(&scanner->delimiters, delimiter);
      lexer->advance(lexer, false);
      lexer->mark_end(lexer);
      lexer->result_symbol = STRING_START;
      return true;
    }
    if (lexer->lookahead == '\'') {
      delimiter.flags |= SingleQuote;
      array_push(&scanner->delimiters, delimiter);
      lexer->advance(lexer, false);
      lexer->mark_end(lexer);
      lexer->result_symbol = STRING_START;
      return true;
    }
    if (lexer->lookahead == '"') {
      delimiter.flags |= DoubleQuote;
      array_push(&scanner->delimiters, delimiter);
      lexer->advance(lexer, false);
      lexer->mark_end(lexer);
      lexer->result_symbol = STRING_START;
      return true;
    }
  }
  return false;
}

bool tree_sitter_basic_external_scanner_scan(void *payload, TSLexer *lexer,
                                             const bool *valid_symbols) {
  Scanner *scanner = (Scanner *)payload;

  if (parse_subscript(scanner, lexer, valid_symbols)) {
    return true;
  }

  if (parse_string(scanner, lexer, valid_symbols)) {
    return true;
  }

  return false;
}
