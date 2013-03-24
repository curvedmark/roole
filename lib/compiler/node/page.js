'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitPage = function(pageNode) {
	var css = '@page ';
	if (pageNode.children[0]) {
		css += ':' + this.visit(pageNode.children[0]) + ' ';
	}
	css += '{\n';
	var propertyListNode = pageNode.children[1];
	this.indent();
	css += this.indentString() + this.visit(propertyListNode);
	this.outdent();
	css += '\n' + this.indentString() + '}';

	return css;
};