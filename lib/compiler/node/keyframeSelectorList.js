'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitKeyframeSelectorList = function(selList) {
	return this.visit(selList.children).join(', ');
};