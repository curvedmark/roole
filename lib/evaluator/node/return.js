'use strict';

var RooleError = require('../../error');
var Evaluator = require('../');

Evaluator.prototype.visitReturn = function(returnNode) {
	if (!this.context) {
		throw RooleError('@return is only allowed inside @function', returnNode);
	}

	if (this.context === 'call') {
		throw this.visit(returnNode.children[0]);
	}

	return null;
};