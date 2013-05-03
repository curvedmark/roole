'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitClassSelector = function(classSel) {
	return '.' + this.visit(classSel.children[0]);
};