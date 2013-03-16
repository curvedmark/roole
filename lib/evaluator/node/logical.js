'use strict';

var Node = require('../../node');
var Evaluator = require('../evaluator');

Evaluator.prototype.visitLogical = function(logicalNode) {
	var leftNode = logicalNode.children[0];
	var operator = logicalNode.children[1];
	var rightNode = logicalNode.children[2];

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