'use strict';

var Evaluator = require('../evaluator');

Evaluator.prototype.visitKeyframe = function(keyframeNode) {
	this.visit(keyframeNode.children);

	var propertyListNode = keyframeNode.children[1];

	if (!propertyListNode.children.length)
		return null;
};