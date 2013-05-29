'use strict';

module.exports = function(compiler, sel) {
	var attr = compiler.visit(sel.children).join(sel.operator);
	return '[' + attr + ']';
};