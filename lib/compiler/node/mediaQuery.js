'use strict';

module.exports = function(compiler, mq) {
	return compiler.visit(mq.children).join(' and ');
};