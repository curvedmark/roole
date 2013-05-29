'use strict';

var Node = require('../../node');

module.exports = function (evaluator, rel) {
	return evaluator.visit(rel.children).then(function (children) {
		var op = rel.operator;
		var left = children[0];
		var right = children[1];
		var loc = left.loc;

		left = Node.toValue(left);
		right = Node.toValue(right);

		var val = op === '>' && left > right ||
			op === '<' && left < right ||
			op === '>=' && left >= right ||
			op === '<=' && left <= right;

		return {
			type: 'boolean',
			children: [val],
			loc: loc,
		};
	});
};