'use strict';

var Node = require('../../node');

module.exports = function (evaluator, logical) {
	return evaluator.visit(logical.children[0]).then(function (left) {
		var op = logical.operator;
		if (
			op === 'and' && !Node.toBoolean(left) ||
			op === 'or' && Node.toBoolean(left)
		) {
			return left;
		}
		return evaluator.visit(logical.children[1]);
	});
};