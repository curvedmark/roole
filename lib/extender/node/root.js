'use strict';

var Extender = require('../');

Extender.prototype.visitRoot = function(rootNode) {
	var extendBoundaryNode = this.extendBoundaryNode;
	this.extendBoundaryNode = rootNode;

	this.visit(rootNode.children);

	this.extendBoundaryNode = extendBoundaryNode;
};