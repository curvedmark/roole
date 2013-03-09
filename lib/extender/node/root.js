'use strict';

var Extender = require('../extender');

Extender.prototype.visitRoot = function(rootNode) {
	var filePath = this.filePath;
	this.filePath = rootNode.filePath;

	var extendBoundaryNode = this.extendBoundaryNode;
	this.extendBoundaryNode = rootNode;

	this.visit(rootNode.children);

	this.filePath = filePath;
	this.extendBoundaryNode = extendBoundaryNode;
};