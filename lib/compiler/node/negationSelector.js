'use strict';

var Compiler = require('../');

Compiler.prototype.visitNegationSelector = function(sel) {
	return ':not(' + this.visit(sel.children[0]) + ')';
};