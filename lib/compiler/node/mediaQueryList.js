'use strict';

module.exports = function(compiler, mqList) {
	return compiler.visit(mqList.children).join(', ');
};