'use strict';

module.exports = function (evaluator, node) {
	if (!node.children) return;
	return evaluator.visit(node.children).then(function () {
		return node;
	});
};