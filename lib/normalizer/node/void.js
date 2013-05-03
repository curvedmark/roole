'use strict';

var Normalizer = require('../');

Normalizer.prototype.visitVoid = function(voidNode) {
	var inVoid = this.inVoid;
	this.inVoid = true;

	var ruleList = voidNode.children[0];
	var children = this.visit(ruleList.children);

	this.inVoid = inVoid;

	return children;
};