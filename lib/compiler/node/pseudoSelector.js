'use strict';

module.exports = function(compiler, sel) {
	var colon = sel.doubleColon ? '::' : ':';
	var name = compiler.visit(sel.children[0]);
	var args = compiler.visit(sel.children[1]) || '';
	if (args) args = '(' + args + ')';
	return colon + name + args;
};