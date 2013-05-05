'use strict';

var Compiler = require('../');

Compiler.prototype.visitHashSelector = function(sel) {
	return '#' + this.visit(sel.children[0]);
};