'use strict';

var Normalizer = require('../normalizer');

Normalizer.prototype.visitRoot = function(rootNode) {
	var parentRoot = this.parentRoot;
	this.parentRoot = rootNode;

	var fileName = this.fileName;
	this.fileName = rootNode.fileName;

	var childNodes = this.visit(rootNode.children);

	this.parentRoot = parentRoot;
	this.fileName = fileName;

	if (parentRoot && !childNodes.length) {
		return null;
	}
};