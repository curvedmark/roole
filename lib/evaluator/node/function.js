'use strict';

var Evaluator = require('../evaluator');

Evaluator.prototype.visitFunction = function(functionNode) {
	var parameterListNode = functionNode.children[0];
	parameterListNode.children.forEach(function(parameterNode) {
		if (parameterNode.type !== 'parameter') {
			return;
		}

		parameterNode.children[1] = this.visit(parameterNode.children[1]);
	}, this);
};