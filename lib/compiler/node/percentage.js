'use strict';

var Compiler = require('../');

Compiler.prototype.visitPercentage = function(percentage) {
	var num = +percentage.children[0].toFixed(this.options.precision);
	return num + '%';
};