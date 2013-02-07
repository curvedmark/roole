'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitSeparator = function(separatorNode) {
	var value = separatorNode.children[0]
	if (value === ',')
		value += ' '

	return value
}