'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitCall = function(callNode) {
	var functionName = this.visit(callNode.children[0]);
	var args = this.visit(callNode.children[1]);

	return functionName + '(' + args + ')';
};