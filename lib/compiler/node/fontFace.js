'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitFontFace = function(fontFace) {
	return '@font-face '+ this.visit(fontFace.children[0]);
};