'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitCombinator = function(combinator) {
	var value = combinator.children[0];
	if (value !== ' ') value = ' ' + value + ' ';
	return value;
};