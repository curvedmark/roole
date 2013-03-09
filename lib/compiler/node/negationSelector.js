'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitNegationSelector = function(negationSelectorNode) {
	return ':not(' + this.visit(negationSelectorNode.children[0]) + ')';
};