'use strict';

var Compiler = require('../');

Compiler.prototype.visitFontFace = function(fontFace) {
	return '@font-face '+ this.visit(fontFace.children[0]);
};