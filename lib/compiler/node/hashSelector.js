'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitHashSelector = function(hashSel) {
	return '#' + this.visit(hashSel.children[0]);
};