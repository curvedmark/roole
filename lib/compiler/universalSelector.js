'use strict';

var Compiler = require('./');

Compiler.prototype.visitUniversalSelector = function() {
	return '*';
};