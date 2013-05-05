'use strict';

var Node = require('../../node');
var Evaluator = require('../');

Evaluator.prototype.visitLogical = function(logicalNode) {
	var operator = logicalNode.operator;
	var leftNode = logicalNode.children[0];
	var rightNode = logicalNode.children[1];

	switch (operator) {
	case 'and':
		leftNode = this.visit(leftNode);
		if (!Node.toBoolean(leftNode)) {
			return leftNode;
		}

		return this.visit(rightNode);

	case 'or':
		leftNode = this.visit(leftNode);
		if (Node.toBoolean(leftNode)) {
			return leftNode;
		}

		return this.visit(rightNode);
	}
};