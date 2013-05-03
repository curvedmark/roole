'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitPercentage = function(percentage) {
	var num = +percentage.children[0].toFixed(this.precision);
	return num + '%';
};