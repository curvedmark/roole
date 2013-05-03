'use strict';

var Compiler = require('./');

Compiler.prototype.visitMediaQuery = function(mediaQueryNode) {
	return this.visit(mediaQueryNode.children).join(' and ');
};