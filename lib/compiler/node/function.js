'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitFunction = function(functionNode) {
	var functionName = this.visit(functionNode.children[0])
	var functionArguments = this.visit(functionNode.children[1])

	return functionName + '(' + functionArguments + ')'
}