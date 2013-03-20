'use strict';

var Node = require('../../node');
var Evaluator = require('../evaluator');

Evaluator.prototype.visitRelational = function(relationalNode) {
	var leftNode = this.visit(relationalNode.children[0]);
	var operator = relationalNode.children[1];
	var rightNode = this.visit(relationalNode.children[2]);

	var trueNode = function() {
		return Node('boolean', [true], {loc: leftNode.loc});
	};
	var falseNode = function() {
		return Node('boolean', [false], {loc: leftNode.loc});
	};

	var leftValue, rightValue;
	if (
		leftNode.type === 'identifier' && rightNode.type === 'identifier' ||
		leftNode.type === 'string' && rightNode.type === 'string'
	) {
		leftValue = leftNode.children[0];
		rightValue = rightNode.children[0];
	} else {
		leftValue = Node.toNumber(leftNode);
		if (leftValue === null) {
			return falseNode();
		}

		rightValue = Node.toNumber(rightNode);
		if (rightValue === null) {
			return falseNode();
		}
	}

	switch (operator) {
	case '>':
		return leftValue > rightValue ? trueNode() : falseNode();
	case '>=':
		return leftValue >= rightValue ? trueNode() : falseNode();
	case '<':
		return leftValue < rightValue ? trueNode() : falseNode();
	case '<=':
		return leftValue <= rightValue ? trueNode() : falseNode();
	}
};