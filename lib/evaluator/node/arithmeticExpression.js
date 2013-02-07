'use strict'

var Err = require('../../err')
var Node = require('../../node')

var Evaluator = require('../evaluator')

Evaluator.prototype.visitArithmeticExpression = function(arithmeticExpressionNode) {
	var leftNode = this.visit(arithmeticExpressionNode.children[0])
	var operator = arithmeticExpressionNode.children[1]
	var rightNode = this.visit(arithmeticExpressionNode.children[2])

	switch (leftNode.type + ' ' + operator + ' ' + rightNode.type) {
	case 'number + number':
	case 'percentage + number':
	case 'percentage + percentage':
	case 'percentage + dimension':
	case 'dimension + number':
	case 'dimension + percentage':
	case 'dimension + dimension':
	case 'identifier + number':
	case 'identifier + boolean':
	case 'identifier + identifier':
	case 'string + number':
	case 'string + boolean':
	case 'string + identifier':
	case 'string + string':
		var leftClone = Node.clone(leftNode)
		leftClone.children[0] += rightNode.children[0]
		return leftClone

	case 'identifier + percentage':
	case 'identifier + dimension':
	case 'string + dimension':
		var leftClone = Node.clone(leftNode)
		leftClone.children[0] += rightNode.children.join('')
		return leftClone

	case 'string + percentage':
		var leftClone = Node.clone(leftNode)
		leftClone.children[0] += rightNode.children[0] + '%'
		return leftClone

	case 'number + percentage':
	case 'number + dimension':
	case 'number + identifier':
	case 'number + string':
	case 'boolean + identifier':
	case 'boolean + string':
	case 'identifier + string':
		var rightClone = Node.clone(rightNode)
		rightClone.children[0] = leftNode.children[0] + rightClone.children[0]
		return rightClone

	case 'dimension + identifier':
	case 'dimension + string':
		var rightClone = Node.clone(rightNode)
		rightClone.children[0] = leftNode.children.join('') + rightClone.children[0]
		return rightClone

	case 'percentage + string':
		var rightClone = Node.clone(rightNode)
		rightClone.children[0] = leftNode.children[0] + '%' + rightClone.children[0]
		return rightClone

	case 'number - number':
	case 'percentage - percentage':
	case 'percentage - number':
	case 'percentage - dimension':
	case 'dimension - dimension':
	case 'dimension - number':
	case 'dimension - percentage':
		var leftClone = Node.clone(leftNode)
		leftClone.children[0] -= rightNode.children[0]
		return leftClone

	case 'number - dimension':
	case 'number - percentage':
		var rightClone = Node.clone(rightNode)
		rightClone.children[0] = leftNode.children[0] - rightNode.children[0]
		return rightClone

	case 'number * number':
	case 'percentage * percentage':
	case 'percentage * number':
	case 'percentage * dimension':
	case 'dimension * dimension':
	case 'dimension * number':
	case 'dimension * percentage':
		var leftClone = Node.clone(leftNode)
		leftClone.children[0] *= rightNode.children[0]
		return leftClone

	case 'number * dimension':
	case 'number * percentage':
		var rightClone = Node.clone(rightNode)
		rightClone.children[0] = leftNode.children[0] * rightNode.children[0]
		return rightClone

	case 'number / number':
	case 'percentage / percentage':
	case 'percentage / number':
	case 'percentage / dimension':
	case 'dimension / dimension':
	case 'dimension / number':
	case 'dimension / percentage':
		var divisor = rightNode.children[0]
		if (!divisor)
			throw Err('divide by zero', rightNode, this.filePath)

		var leftClone = Node.clone(leftNode)
		leftClone.children[0] /= divisor
		return leftClone

	case 'number / dimension':
	case 'number / percentage':
		var divisor = rightNode.children[0]
		if (!divisor)
			throw Err('divide by zero', rightNode, this.filePath)

		var rightClone = Node.clone(rightNode)
		rightClone.children[0] = leftNode.children[0] / divisor
		return rightClone
	}

	throw Err("unsupported binary operation: '" + leftNode.type + "' " + operator + " '" + rightNode.type + "'", leftNode, this.filePath)
}