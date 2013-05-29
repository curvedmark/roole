'use strict';

var Node = require('../../node');

module.exports = function (evaluator, assign) {
	return evaluator.visit(assign.children[1]).then(function (val) {
		var variable = assign.children[0];
		var name = variable.children[0];
		var op = assign.operator;

		switch (op) {
		case '?=':
			if (!evaluator.scope.resolve(name)) {
				evaluator.scope.define(name, val);
			}
			return null;
		case '=':
			evaluator.scope.define(name, val);
			return null;
		default:
			op = op.charAt(0);
			return evaluator.visit(variable).then(function (origVal) {
				val = Node.perform(op, origVal, val);
				evaluator.scope.define(name, val);
				return null;
			});
		}
	});
};