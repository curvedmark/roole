'use strict';

var Err = require('../../err');
var Evaluator = require('../evaluator');

Evaluator.prototype.visitReturn = function(returnNode) {
	if (!this.insideFunction) {
		throw Err('@return is only allowed inside @function', returnNode, this.fileName);
	}

	if (!this.insideMixin) {
		throw this.visit(returnNode.children[0]);
	}

	return null;
};