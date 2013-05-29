'use strict';

module.exports = function(compiler, charset) {
	var comments = compiler.comments(charset);
	var value = compiler.visit(charset.children[0]);
	return comments + '@charset ' + value + ';';
};