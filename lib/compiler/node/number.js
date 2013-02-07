'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitNumber = function(numberNode) {
	return '' + +numberNode.children[0].toFixed(this.precision)
}