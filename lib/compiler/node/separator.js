'use strict';

module.exports = function(compiler, sep) {
	sep = sep.children[0];
	if (sep === ',') sep += ' ';
	return sep;
};