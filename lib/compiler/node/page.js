'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitPage = function(pageNode) {
	var css = '@page ';
	if (pageNode.children[0]) {
		css += ':' + this.visit(pageNode.children[0]) + ' ';
	}
	var propertyListNode = pageNode.children[1];
	css += this.visit(propertyListNode);
	return css;
};