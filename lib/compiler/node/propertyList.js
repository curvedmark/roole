'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitPropertyList = function(propertyListNode) {
	return this.visit(propertyListNode.children).join(';\n' + this.indentString()) + ';'
}