'use strict';

var Compiler = require('../');

Compiler.prototype.visitSeparator = function(sep) {
	sep = sep.children[0];
	if (sep === ',') sep += ' ';
	return sep;
};