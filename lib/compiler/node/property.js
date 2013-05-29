'use strict';

module.exports = function(compiler, prop) {
	var name = compiler.visit(prop.children[0]);
	var value = compiler.visit(prop.children[1]);
	var priority = prop.priority || '';
	if (priority) priority = ' ' + priority;
	var indent = compiler.indent();
	var comments = compiler.comments(prop);
	return comments + indent + name + ': ' +  value + priority + ';';
};