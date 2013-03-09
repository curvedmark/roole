'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitFontFace = function(fontFaceNode) {
	var css = '@font-face {\n';
	this.indent();
	css += this.indentString() + this.visit(fontFaceNode.children[0]);
	this.outdent();
	css += '\n' + this.indentString() + '}';

	return css;
};