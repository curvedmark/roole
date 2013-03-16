'use strict';

var Extender = require('../extender');

Extender.prototype.visitVoid = function(voidNode) {
	var insideVoid = this.insideVoid;
	this.insideVoid = true;

	var extendBoundaryNode = this.extendBoundaryNode;
	this.extendBoundaryNode = voidNode;

	this.visit(voidNode.children);

	this.insideVoid = insideVoid;
	this.extendBoundaryNode = extendBoundaryNode;
};