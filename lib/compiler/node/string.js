'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitString = function(stringNode) {
	return stringNode.quote + stringNode.children[0] + stringNode.quote
}