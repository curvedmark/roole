'use strict';

module.exports = function(compiler, argList) {
	return compiler.visit(argList.children).join(', ');
};