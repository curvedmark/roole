'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitPercentage = function(percentageNode) {
	return +percentageNode.children[0].toFixed(this.precision) + '%'
}