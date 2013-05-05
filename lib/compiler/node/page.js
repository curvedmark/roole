'use strict';

var Compiler = require('../');

Compiler.prototype.visitPage = function(page) {
	var comments = this.comments(page);
	var name = this.visit(page.children[0]) || '';
	if (name) name = ' :' + name;
	var ruleList = this.visit(page.children[1]);
	return comments + '@page' + name + ' ' + ruleList;
};