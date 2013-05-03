'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitProperty = function(prop) {
	var name = this.visit(prop.children[0]);
	var value = this.visit(prop.children[1]);
	var priority = prop.children[2] || '';
	if (priority) priority = ' ' + priority;
	return this.indent() + name + ': ' +  value + priority + ';';
};