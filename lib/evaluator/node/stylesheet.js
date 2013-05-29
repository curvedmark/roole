'use strict';

module.exports = function (evaluator, stylesheet) {
	var parentBoundary = evaluator.boundary;
	evaluator.boundary = stylesheet;
	return evaluator.visit(stylesheet.children).then(function () {
		evaluator.boundary = parentBoundary;
		return stylesheet;
	});
};