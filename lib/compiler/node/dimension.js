'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitDimension = function(dimen) {
	var num = +dimen.children[0].toFixed(this.precision);
	var unit = dimen.children[1];
	return num + unit;
};