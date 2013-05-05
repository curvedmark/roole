'use strict';

var Compiler = require('../');

Compiler.prototype.visitRoot = function(root) {
	var comments = this.comments(root);
	var rules = root.children.reduce(function (css, child, i) {
		var str = this.visit(child);
		if (!child.level && i) css += '\n';
		return css + str + '\n';
	}.bind(this), '');
	return comments + rules;
};