'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitPseudoSelector = function(pseudoSelectorNode) {
	return (pseudoSelectorNode.doubled ? '::' : ':') + this.visit(pseudoSelectorNode.children[0])
}