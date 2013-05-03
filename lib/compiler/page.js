'use strict';

var Compiler = require('./');

Compiler.prototype.visitPage = function(page) {
	var name = this.visit(page.children[0]) || '';
	if (name) name = ' :' + name;
	var propList = this.visit(page.children[1]);
	return '@page' + name + ' ' + propList;
};