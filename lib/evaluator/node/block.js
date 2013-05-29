'use strict';

module.exports = function (evaluator, block) {
	evaluator.scope.push();
	return evaluator.visit(block.children[0]).then(function (ruleList) {
		evaluator.scope.pop();
		return ruleList.children;
	});
};