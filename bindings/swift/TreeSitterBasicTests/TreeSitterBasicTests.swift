import XCTest
import SwiftTreeSitter
import TreeSitterBasic

final class TreeSitterBasicTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_basic())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Basic grammar")
    }
}
