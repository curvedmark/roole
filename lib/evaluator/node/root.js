'use strict';

var Evaluator = require('../evaluator');

Evaluator.prototype.visitRoot = function(rootNode) {
	var fileName = this.fileName;
	this.fileName = rootNode.fileName;

	this.visit(rootNode.children);

	this.fileName = fileName;
};