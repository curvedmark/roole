'use strict';

module.exports = function(compiler, importNode) {
	var comments = compiler.comments(importNode);
	var url = compiler.visit(importNode.children[0]);
	var mq = compiler.visit(importNode.children[1]) || '';
	if (mq) mq = ' ' + mq;
	return comments + '@import ' + url + mq + ';';
};