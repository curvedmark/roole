'use strict';

var Evaluator = require('../');

Evaluator.prototype.visitFontFace = function(fontFaceNode) {
	var ruleList = this.visit(fontFaceNode.children[0]);

	if (!ruleList.children.length) {
		return null;
	}
};