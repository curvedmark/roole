'use strict';

var Compiler = require('./');

Compiler.prototype.visitCall = function(call) {
	var name = this.visit(call.children[0]);
	var args = this.visit(call.children[1]);
	return name + '(' + args + ')';
};