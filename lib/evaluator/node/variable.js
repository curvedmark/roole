'use strict'

var Err = require('../../err')
var Node = require('../../node')

var Evaluator = require('../evaluator')

Evaluator.prototype.visitVariable = function(variableNode) {
	var variableName = variableNode.children[0]
	var valueNode = this.scope.resolve(variableName)

	if (!valueNode)
		throw Err('$' + variableName + ' is undefined', variableNode, this.filePath)

	valueNode = Node.clone(valueNode, false)
	valueNode.loc = variableNode.loc

	return valueNode
}