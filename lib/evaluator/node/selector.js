'use strict';

module.exports = function (evaluator, sel) {
	return evaluator.visit(sel.children).then(function (children) {
		var nodes = [];
		var prevIsComb = false;

		// make sure selector interpolation not to result in
		// two consecutive combinators
		children.forEach(function (child) {
			if (child.type !== 'combinator') {
				prevIsComb = false;
			} else if (prevIsComb) {
				nodes.pop();
			} else {
				prevIsComb = true;
			}
			nodes.push(child);
		});
		sel.children = nodes;
	});
};