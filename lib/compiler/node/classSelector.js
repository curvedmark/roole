'use strict';

var Compiler = require('../');

Compiler.prototype.visitClassSelector = function(sel) {
	return '.' + this.visit(sel.children[0]);
};