'use strict';

module.exports = function(compiler, mt) {
	var modifier = mt.modifier || '';
	if (modifier) modifier += ' ';
	var name = compiler.visit(mt.children[0]);
	return modifier + name;
};