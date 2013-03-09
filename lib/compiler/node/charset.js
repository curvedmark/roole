'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitCharset = function(charsetNode) {
	return '@charset ' + this.visit(charsetNode.children[0]) + ';';
};