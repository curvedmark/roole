'use strict';

module.exports = function(compiler, percent) {
	var num = +percent.children[0].toFixed(compiler.options.precision);
	return num + '%';
};