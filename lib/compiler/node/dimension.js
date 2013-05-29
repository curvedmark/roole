'use strict';

module.exports = function(compiler, dimen) {
	var num = +dimen.children[0].toFixed(compiler.options.precision);
	var unit = dimen.children[1];
	return num + unit;
};