'use strict';

module.exports = function(compiler, sel) {
	return '#' + compiler.visit(sel.children[0]);
};