'use strict';

var Err = require('../../err');
var Evaluator = require('../evaluator');

Evaluator.prototype.visitReturn = function(returnNode) {
	if (!this.context) {
		throw Err('@return is only allowed inside @function', returnNode, this.filename);
	}

	if (this.context === 'call') {
		throw this.visit(returnNode.children[0]);
	}

	return null;
};