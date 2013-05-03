'use strict';

var Compiler = require('./');

Compiler.prototype.visitNumber = function(num) {
	num = +num.children[0].toFixed(this.options.precision);
	return num.toString();
};