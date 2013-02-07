'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitDimension = function(dimensionNode) {
	return +dimensionNode.children[0].toFixed(this.precision) + dimensionNode.children[1]
}