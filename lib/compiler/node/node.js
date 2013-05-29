'use strict';

module.exports = function (compiler, node) {
	return compiler.visit(node.children).join('');
};