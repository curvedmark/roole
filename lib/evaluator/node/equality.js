'use strict';

var Node = require('../../node');
var Evaluator = require('../');

Evaluator.prototype.visitEquality = function(equalityNode) {
	var operator = equalityNode.operator;
	var leftNode = this.visit(equalityNode.children[0]);
	var rightNode = this.visit(equalityNode.children[1]);

	var trueNode = function() {
		return {
			type: 'boolean',
			children: [true],
			loc: leftNode.loc,
		};
	};
	var falseNode = function() {
		return {
			type: 'boolean',
			children: [false],
			loc: leftNode.loc,
		};
	};

	switch (operator) {
	case 'is':
		return Node.equal(leftNode, rightNode) ? trueNode() : falseNode();
	case 'isnt':
		return !Node.equal(leftNode, rightNode) ? trueNode() : falseNode();
	}
};