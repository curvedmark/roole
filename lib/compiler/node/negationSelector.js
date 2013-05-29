'use strict';

module.exports = function(compiler, sel) {
	return ':not(' + compiler.visit(sel.children[0]) + ')';
};