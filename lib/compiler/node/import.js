'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitImport = function(importNode) {
	var url = this.visit(importNode.children[0]);
	var mediaQuery = this.visit(importNode.children[1]);

	var css = '@import ' + url;
	if (mediaQuery) { css += ' ' + mediaQuery; }
	css += ';';

	return  css;
};