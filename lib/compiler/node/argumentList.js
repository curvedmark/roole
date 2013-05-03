'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitArgumentList = function(argList) {
	return this.visit(argList.children).join(', ');
};