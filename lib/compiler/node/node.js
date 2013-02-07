'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitNode = function(node) {
	return this.visit(node.children).join('')
}