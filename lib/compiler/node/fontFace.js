'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitFontFace = function(fontFaceNode) {
	return '@font-face '
	     + this.visit(fontFaceNode.children[0]);
};