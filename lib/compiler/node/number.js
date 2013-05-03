'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitNumber = function(num) {
	num = +num.children[0].toFixed(this.precision);
	return num.toString();
};