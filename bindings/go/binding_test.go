package tree_sitter_basic_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-basic"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_basic.Language())
	if language == nil {
		t.Errorf("Error loading Basic grammar")
	}
}
