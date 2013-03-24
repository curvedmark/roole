'use strict';

var Evaluator = require('../evaluator');

Evaluator.prototype.visitKeyframe = function(keyframeNode) {
	this.visit(keyframeNode.children[0]);

	this.scope.add();

	var ruleListNode = this.visit(keyframeNode.children[1]);

	this.scope.remove();

	if (!ruleListNode.children.length) {
		return null;
	}
};