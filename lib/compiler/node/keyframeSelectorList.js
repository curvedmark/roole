'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitKeyframeSelectorList = function(keyframeSelectorListNode) {
	return this.indent() + this.visit(keyframeSelectorListNode.children).join(', ');
};