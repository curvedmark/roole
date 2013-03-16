'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitPseudoSelector = function(pseudoSelectorNode) {
	var css = pseudoSelectorNode.doubled ? '::' : ':';
	css += this.visit(pseudoSelectorNode.children[0]);

	if (pseudoSelectorNode.children[1]) {
		css += '(' + this.visit(pseudoSelectorNode.children[1]) + ')';
	}

	return css;
};