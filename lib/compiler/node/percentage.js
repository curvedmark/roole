'use strict';

var Compiler = require('../');

Compiler.prototype.visitPercentage = function(per) {
	var num = +per.children[0].toFixed(this.options.precision);
	return num + '%';
};