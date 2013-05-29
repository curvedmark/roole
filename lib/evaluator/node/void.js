'use strict';

module.exports = function (evaluator, voidNode) {
	evaluator.scope.push();

	var parentVoid = evaluator.void;
	evaluator.void = voidNode;

	var parentBoundary = evaluator.boundary;
	evaluator.boundary = voidNode;

	return evaluator.visit(voidNode.children).then(function () {
		evaluator.scope.pop();
		evaluator.void = parentVoid;
		evaluator.boundary = parentBoundary;
	});
};