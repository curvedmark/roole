'use strict';

var Compiler = require('../');

Compiler.prototype.visitString = function(str) {
	return str.quote + str.children[0] + str.quote;
};