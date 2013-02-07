'use strict'

var Node = require('../../node')

var Evaluator = require('../evaluator')

Evaluator.prototype.visitEqualityExpression = function(equalityExpressionNode) {
	var leftNode = this.visit(equalityExpressionNode.children[0])
	var operator = equalityExpressionNode.children[1]
	var rightNode = this.visit(equalityExpressionNode.children[2])

	var trueNode = function() {
		return Node('boolean', [true], {loc: leftNode.loc})
	}
	var falseNode = function() {
		return Node('boolean', [false], {loc: leftNode.loc})
	}

	switch (operator) {
	case 'is':
		return Node.equal(leftNode, rightNode) ? trueNode() : falseNode()
	case 'isnt':
		return !Node.equal(leftNode, rightNode) ? trueNode() : falseNode()
	}
}