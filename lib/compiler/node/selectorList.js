'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitSelectorList = function(selectorListNode) {
	return this.visit(selectorListNode.children).join(',\n' + this.indentString())
}