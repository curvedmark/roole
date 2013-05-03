'use strict';

var Compiler = require('../');

Compiler.prototype.visitCharset = function(charset) {
	return '@charset ' + this.visit(charset.children[0]) + ';';
};