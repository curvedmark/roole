'use strict';

module.exports = function(compiler, comb) {
	var value = comb.children[0];
	if (value !== ' ') value = ' ' + value + ' ';
	return value;
};