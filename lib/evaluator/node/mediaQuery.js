'use strict';

var Evaluator = require('../');

Evaluator.prototype.visitMediaQuery = function(mediaQueryNode) {
	var childNodes = this.visit(mediaQueryNode.children);

	if (this.interpolatingMediaQuery) {
		return childNodes;
	}
};