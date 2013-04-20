'use strict';

var Normalizer = require('../normalizer');

Normalizer.prototype.visitRoot = function(rootNode) {
	var parentRoot = this.parentRoot;
	this.parentRoot = rootNode;

	var childNodes = this.visit(rootNode.children);

	this.parentRoot = parentRoot;

	if (parentRoot && !childNodes.length) {
		return null;
	}
};