'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitNumber = function(numberNode) {
	var number = +numberNode.children[0].toFixed(this.precision);
	return number.toString();
};