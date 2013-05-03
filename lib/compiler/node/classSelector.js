'use strict';

var Compiler = require('../');

Compiler.prototype.visitClassSelector = function(classSel) {
	return '.' + this.visit(classSel.children[0]);
};