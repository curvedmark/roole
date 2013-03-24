'use strict';

var Extender = require('../extender');

Extender.prototype.visitRoot = function(rootNode) {
	var fileName = this.fileName;
	this.fileName = rootNode.fileName;

	var extendBoundaryNode = this.extendBoundaryNode;
	this.extendBoundaryNode = rootNode;

	this.visit(rootNode.children);

	this.fileName = fileName;
	this.extendBoundaryNode = extendBoundaryNode;
};