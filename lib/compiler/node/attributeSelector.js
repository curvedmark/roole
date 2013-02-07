'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitAttributeSelector = function(attributeSelectorNode) {
	return '[' + this.visit(attributeSelectorNode.children).join('') + ']'
}