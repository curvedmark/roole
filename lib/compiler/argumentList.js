'use strict';

var Compiler = require('./');

Compiler.prototype.visitArgumentList = function(argList) {
	return this.visit(argList.children).join(', ');
};