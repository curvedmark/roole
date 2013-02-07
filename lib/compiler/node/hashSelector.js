'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitHashSelector = function(hashSelectorNode) {
	return '#' + this.visit(hashSelectorNode.children[0])
}