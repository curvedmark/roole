'use strict';

var Evaluator = require('../evaluator');

Evaluator.prototype.visitFunction = function(functionNode) {
	var parameterList = functionNode.children[0];
	this.visit(parameterList);
};