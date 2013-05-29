'use strict';

module.exports = function(evaluator, fontFace) {
	evaluator.scope.push();
	return evaluator.visit(fontFace.children).then(function () {
		evaluator.scope.pop();
	});
};