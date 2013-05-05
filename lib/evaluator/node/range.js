'use strict';

var RooleError = require('../../error');
var Node = require('../../node');
var Evaluator = require('../');

Evaluator.prototype.visitRange = function(rangeNode) {
	this.visit(rangeNode.children);

	var fromNode = rangeNode.children[0];
	var toNode = rangeNode.children[1];

	var invalidNode;
	if (Node.toNumber(fromNode) === null) {
		invalidNode = fromNode;
	} else if (Node.toNumber(toNode) === null) {
		invalidNode = toNode;
	}

	if (invalidNode) {
		throw RooleError("only numberic values are allowed in 'range'", invalidNode);
	}
};