'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitArgumentList = function(argumentListNode) {
	return this.visit(argumentListNode.children).join(', ')
}