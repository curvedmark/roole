'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitCombinator = function(combinatorNode) {
	var value = combinatorNode.children[0]
	if (value !== ' ')
		value = ' ' + value + ' '

	return value
}