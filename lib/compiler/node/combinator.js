'use strict';

var Compiler = require('../');

Compiler.prototype.visitCombinator = function(comb) {
	var value = comb.children[0];
	if (value !== ' ') value = ' ' + value + ' ';
	return value;
};