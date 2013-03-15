'use strict';

var Evaluator = require('../evaluator');

Evaluator.prototype.visitKeyframes = function(keyframesNode) {
	this.visit(keyframesNode.children);

	var keyframeListNode = keyframesNode.children[2];

	if (!keyframeListNode.children.length)
		return null;
};