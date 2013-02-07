'use strict'

var Evaluator = require('../evaluator')

Evaluator.prototype.visitAssignment = function(assignmentNode) {
	var variableNode = assignmentNode.children[0]
	var variableName = variableNode.children[0]
	var operator = assignmentNode.children[1]
	var valueNode = this.visit(assignmentNode.children[2])

	if (operator === '?=' && this.scope.resolve(variableName))
		return null

	this.scope.define(variableName, valueNode)

	return null
}