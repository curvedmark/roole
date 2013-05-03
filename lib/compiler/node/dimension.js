'use strict';

var Compiler = require('../');

Compiler.prototype.visitDimension = function(dimen) {
	var num = +dimen.children[0].toFixed(this.options.precision);
	var unit = dimen.children[1];
	return num + unit;
};