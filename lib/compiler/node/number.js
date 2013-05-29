'use strict';

module.exports = function(compiler, num) {
	num = +num.children[0].toFixed(compiler.options.precision);
	return num.toString();
};