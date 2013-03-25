'use strict';

var Evaluator = require('../evaluator');

Evaluator.prototype.visitRoot = function(rootNode) {
	var filename = this.filename;
	this.filename = rootNode.filename;

	this.visit(rootNode.children);

	this.filename = filename;
};