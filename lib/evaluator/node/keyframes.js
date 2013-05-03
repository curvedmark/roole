'use strict';

var Evaluator = require('../evaluator');

Evaluator.prototype.visitKeyframes = function(keyframesNode) {
	keyframesNode.children[0] = this.visit(keyframesNode.children[0]);

	this.scope.add();

	var keyframeListNode = this.visit(keyframesNode.children[1]);

	this.scope.remove();

	if (!keyframeListNode.children.length) {
		return null;
	}
};