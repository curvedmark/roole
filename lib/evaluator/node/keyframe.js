'use strict';

var Evaluator = require('../evaluator');

Evaluator.prototype.visitKeyframe = function(keyframeNode) {
	this.visit(keyframeNode.children[0]);

	this.scope.add();

	var propertyListNode = this.visit(keyframeNode.children[1]);

	this.scope.remove();

	if (!propertyListNode.children.length)
		return null;
};