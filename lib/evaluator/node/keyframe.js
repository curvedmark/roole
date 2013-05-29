'use strict';

module.exports = function (evaluator, keyframe) {
	return evaluator.visit(keyframe.children[0]).then(function () {
		evaluator.scope.push();
		return evaluator.visit(keyframe.children[1]);
	}).then(function () {
		evaluator.scope.pop();
	});
};