'use strict';

var RooleError = require('../../error');
var Node = require('../../node');

module.exports = function (evaluator, unary) {
	return evaluator.visit(unary.children[0]).then(function (right) {
		var op = unary.operator;
		switch (op + right.type) {
		case '+number':
		case '+percentage':
		case '+dimension':
			return right;
		case '-number':
		case '-percentage':
		case '-dimension':
			var clone = Node.clone(right);
			clone.children[0] = -clone.children[0];
			return clone;
		case '-identifier':
			var clone = Node.clone(right);
			clone.children[0] = '-' + clone.children[0];
			return clone;
		}
		throw new RooleError("unsupported unary operation: " + op + right.type, unary);
	});
};