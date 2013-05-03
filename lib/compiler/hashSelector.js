'use strict';

var Compiler = require('./');

Compiler.prototype.visitHashSelector = function(hashSel) {
	return '#' + this.visit(hashSel.children[0]);
};