'use strict'

var Node = require('../../node')

var Evaluator = require('../evaluator')

Evaluator.prototype.visitLogicalExpression = function(logicalExpressionNode) {
	var leftNode = logicalExpressionNode.children[0]
	var operator = logicalExpressionNode.children[1]
	var rightNode = logicalExpressionNode.children[2]

	switch (operator) {
	case 'and':
		leftNode = this.visit(leftNode)
		if (!Node.toBoolean(leftNode))
			return leftNode

		return this.visit(rightNode)

	case 'or':
		leftNode = this.visit(leftNode)
		if (Node.toBoolean(leftNode))
			return leftNode

		return this.visit(rightNode)
	}
}