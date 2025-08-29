package tree_sitter_basic_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_basic "github.com/tree-sitter/tree-sitter-basic/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_basic.Language())
	if language == nil {
		t.Errorf("Error loading Basic grammar")
	}
}
