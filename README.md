
# tree-sitter-basic

## [Dependencies](https://tree-sitter.github.io/tree-sitter/creating-parsers/1-getting-started.html#dependencies)

### JavaScript runtime

> Tree-sitter grammars are written in JavaScript, and Tree-sitter uses a JavaScript runtime (the default being [Node.js](https://nodejs.org/)) to interpret JavaScript files. It requires this runtime command (default: `node`) to be in one of the directories in your [`PATH`](https://en.wikipedia.org/wiki/PATH_(variable)).

`Node.js` can be installed via Powershell (from an administrative command prompt).

```
winget install -e --id OpenJS.NodeJS.LTS
```

### C Compiler

> Tree-sitter creates parsers that are written in C. To run and test these parsers with the `tree-sitter parse` or `tree-sitter test` commands, you must have a C/C++ compiler installed. Tree-sitter will try to look for these compilers in the standard places for each platform.

### [Tree-sitter CLI](https://tree-sitter.github.io/tree-sitter/creating-parsers/1-getting-started.html#installation)

> To create a Tree-sitter parser, you need to use [the  `tree-sitter`  CLI](https://github.com/tree-sitter/tree-sitter/tree/master/cli).

[Latest Github release](https://github.com/tree-sitter/tree-sitter/releases/latest)


## Development

### Overview
The following are the main files we edit for generating, parsing, highlighting and testing grammar:

 - `grammar.js` ([Writing the Grammar](https://tree-sitter.github.io/tree-sitter/creating-parsers/3-writing-the-grammar.html#writing-the-grammar))
 - `test/corpus/declarations.txt` (Unit tests for grammar. [Writing Tests](https://tree-sitter.github.io/tree-sitter/creating-parsers/5-writing-tests.html#writing-tests))
 - `queries/highlights.scm` (Associate syntax node to highlight name. [Syntax Highlighting](https://tree-sitter.github.io/tree-sitter/3-syntax-highlighting.html#syntax-highlighting))
 - `test/highlight/**` (Unit tests for highlighting. [Syntax Highlighting - Unit Testing](https://tree-sitter.github.io/tree-sitter/3-syntax-highlighting.html#unit-testing))
 - `src/scanner.c` (For more complex parsing. E.g. disambiguate less-than vs subscript/template. [External Scanners](https://tree-sitter.github.io/tree-sitter/creating-parsers/4-external-scanners.html)

### Getting started

To start run:

```
npm install
```

### Generate grammar

After making changes to `grammar.js`, run `tree-sitter generate` ([Generate](https://tree-sitter.github.io/tree-sitter/creating-parsers/1-getting-started.html#generate)) to generate the C code for parsing.

### Testing grammar

Run `tree-sitter test`, to test the changes in grammar match what is expected in `test/corpus/declarations.txt`.

### Parsing/highlighting source file

Run `tree-sitter parse [source-file]` or `tree-sitter hightlight [source-file]` to parse/highlight the source file and generate a syntax tree or examine highlighted text. Good for diagnosing edge cases and manually testing larger files.
