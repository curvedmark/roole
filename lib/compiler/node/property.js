'use strict';

var Compiler = require('../');

Compiler.prototype.visitProperty = function(prop) {
	var name = this.visit(prop.children[0]);
	var value = this.visit(prop.children[1]);
	var priority = prop.priority || '';
	if (priority) priority = ' ' + priority;
	var indent = this.indent();
	var comments = this.comments(prop);
	return comments + indent + name + ': ' +  value + priority + ';';
};