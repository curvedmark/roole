'use strict';

module.exports = function(compiler, mf) {
	var name = compiler.visit(mf.children[0]);
	var value = compiler.visit(mf.children[1]) || '';
	if (value) value = ': ' + value;
	return '(' + name + value + ')';
};