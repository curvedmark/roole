'use strict';

var Evaluator = require('../evaluator');

Evaluator.prototype.visitMixin = function(mixinNode) {
	var insideMixin = this.insideMixin;
	this.insideMixin = true;

	var ruleNodes = this.visit(mixinNode.children[0]);

	this.insideMixin = insideMixin;

	return ruleNodes;
};