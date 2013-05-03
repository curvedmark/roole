'use strict';

var Compiler = require('./');

Compiler.prototype.visitNegationSelector = function(negationSelectorNode) {
	return ':not(' + this.visit(negationSelectorNode.children[0]) + ')';
};