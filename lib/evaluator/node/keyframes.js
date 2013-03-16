'use strict';

var Evaluator = require('../evaluator');

Evaluator.prototype.visitKeyframes = function(keyframesNode) {
	keyframesNode.children[1] = this.visit(keyframesNode.children[1]);

	this.scope.add();

	var keyframeListNode = this.visit(keyframesNode.children[2]);

	this.scope.remove();

	if (!keyframeListNode.children.length) {
		return null;
	}
};