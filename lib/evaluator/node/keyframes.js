'use strict';

module.exports = function (evaluator, keyframes) {
	return evaluator.visit(keyframes.children[0]).then(function (name) {
		keyframes.children[0] = name;
		evaluator.scope.push();
		return evaluator.visit(keyframes.children[1]);
	}).then(function () {
		evaluator.scope.pop();
	});
};