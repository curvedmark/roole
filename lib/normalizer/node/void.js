'use strict';

var Normalizer = require('../normalizer');

Normalizer.prototype.visitVoid = function(voidNode) {
	var insideVoid = this.insideVoid;
	this.insideVoid = true;

	var ruleListNode = voidNode.children[0];
	this.visit(ruleListNode);

	this.insideVoid = insideVoid;

	return ruleListNode.children;
};