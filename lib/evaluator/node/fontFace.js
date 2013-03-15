'use strict';

var Evaluator = require('../evaluator');

Evaluator.prototype.visitFontFace = function(fontFaceNode) {
	this.visit(fontFaceNode.children);

	var propertyListNode = fontFaceNode.children[0];

	if (!propertyListNode.children.length)
		return null;
};