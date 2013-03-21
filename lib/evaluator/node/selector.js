'use strict';

var Evaluator = require('../evaluator');

Evaluator.prototype.visitSelector = function(selectorNode) {
	this.visit(selectorNode.children);

	var childNodes = [];
	var prevIsCombinator = false;
	selectorNode.children.forEach(function(childNode) {
		// make sure selector interpolation not to result in
		// two consecutive combinators
		if (childNode.type === 'combinator') {
			if (prevIsCombinator) {
				childNodes.pop();
			} else {
				prevIsCombinator = true;
			}
		} else {
			prevIsCombinator = false;
		}

		childNodes.push(childNode);
	}, this);

	selectorNode.children = childNodes;
};