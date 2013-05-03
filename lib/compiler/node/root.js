'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitRoot = function(rootNode) {
	return this.visit(rootNode.children).reduce(function (css, child, i) {
		if (!/^\s/.test(child) && i) css += '\n';
		css += child;
		return css;
	}, '');
};