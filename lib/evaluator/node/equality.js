'use strict';

var Node = require('../../node');

module.exports = function (evaluator, eq) {
	return evaluator.visit(eq.children).then(function (children) {
		var op = eq.operator;
		var left = children[0];
		var right = children[1];

		var val = op === 'is' && Node.equal(left, right) ||
			op === 'isnt' && !Node.equal(left, right);

		return {
			type: 'boolean',
			children: [val],
			loc: left.loc,
		};
	});
};