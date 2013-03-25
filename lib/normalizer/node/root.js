'use strict';

var Normalizer = require('../normalizer');

Normalizer.prototype.visitRoot = function(rootNode) {
	var parentRoot = this.parentRoot;
	this.parentRoot = rootNode;

	var filename = this.filename;
	this.filename = rootNode.filename;

	var childNodes = this.visit(rootNode.children);

	this.parentRoot = parentRoot;
	this.filename = filename;

	if (parentRoot && !childNodes.length) {
		return null;
	}
};