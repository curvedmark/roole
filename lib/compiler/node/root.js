'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitRoot = function(rootNode) {
	return this.visit(rootNode.children).join('\n\n')
}