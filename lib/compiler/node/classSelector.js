'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitClassSelector = function(classSelectorNode) {
	return '.' + this.visit(classSelectorNode.children[0])
}