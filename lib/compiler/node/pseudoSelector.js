'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitPseudoSelector = function(sel) {
	var colon = sel.doubleColon ? '::' : ':';
	var name = this.visit(sel.children[0]);
	var args = this.visit(sel.children[1]) || '';
	if (args) args = '(' + args + ')';
	return colon + name + args;
};