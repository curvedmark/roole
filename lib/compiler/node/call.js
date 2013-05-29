'use strict';

module.exports = function(compiler, call) {
	var name = compiler.visit(call.children[0]);
	var args = compiler.visit(call.children[1]);
	return name + '(' + args + ')';
};