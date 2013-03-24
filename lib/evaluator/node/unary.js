'use strict';

var Err = require('../../err');
var Node = require('../../node');
var Evaluator = require('../evaluator');

Evaluator.prototype.visitUnary = function(unaryNode) {
	var operator = unaryNode.children[0];
	var operandNode = this.visit(unaryNode.children[1]);

	switch (operator + operandNode.type) {
	case '+number':
	case '+percentage':
	case '+dimension':
		var operandClone = Node.clone(operandNode);
		return operandClone;

	case '-number':
	case '-percentage':
	case '-dimension':
		var operandClone = Node.clone(operandNode);
		operandClone.children[0] = -operandClone.children[0];
		return operandClone;

	case '-identifier':
		var operandClone = Node.clone(operandNode);
		operandClone.children[0] = '-' + operandClone.children[0];
		return operandClone;
	}

	throw Err("unsupported unary operation: " + operator + "'" + operandNode.type + "'", unaryNode, this.fileName);
};