'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitColor = function(colorNode) {
	return '#' + colorNode.children[0]
}