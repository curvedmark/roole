'use strict';

var Compiler = require('./');

Compiler.prototype.visitSeparator = function(separator) {
	separator = separator.children[0];
	if (separator === ',') separator += ' ';
	return separator;
};