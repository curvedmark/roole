'use strict';

var Extender = require('../extender');

Extender.prototype.visitRoot = function(rootNode) {
	var filename = this.filename;
	this.filename = rootNode.filename;

	var extendBoundaryNode = this.extendBoundaryNode;
	this.extendBoundaryNode = rootNode;

	this.visit(rootNode.children);

	this.filename = filename;
	this.extendBoundaryNode = extendBoundaryNode;
};