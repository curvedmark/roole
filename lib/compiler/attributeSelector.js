'use strict';

var Compiler = require('./');

Compiler.prototype.visitAttributeSelector = function(sel) {
	var attr = this.visit(sel.children).join('');
	return '[' + attr + ']';
};