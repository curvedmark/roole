'use strict';

var Node = require('../../node');

module.exports = function (evaluator, arith) {
	return evaluator.visit(arith.children).then(function (children) {
		return Node.perform(arith.operator, children[0], children[1]);
	});
};