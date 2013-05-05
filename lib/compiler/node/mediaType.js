'use strict';

var Compiler = require('../');

Compiler.prototype.visitMediaType = function(mt) {
	var modifier = mt.modifier || '';
	if (modifier) modifier += ' ';
	var name = this.visit(mt.children[0]);

	return modifier + name;
};