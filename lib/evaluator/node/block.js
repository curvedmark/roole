'use strict';

var Evaluator = require('../');

Evaluator.prototype.visitBlock = function(blockNode) {
	this.scope.add();

	var ruleListNode = blockNode.children[0];
	this.visit(ruleListNode);

	this.scope.remove();

	return ruleListNode.children;
};