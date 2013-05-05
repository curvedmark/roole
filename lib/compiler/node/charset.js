'use strict';

var Compiler = require('../');

Compiler.prototype.visitCharset = function(charset) {
	var comments = this.comments(charset);
	var value = this.visit(charset.children[0]);
	return comments + '@charset ' + value + ';';
};