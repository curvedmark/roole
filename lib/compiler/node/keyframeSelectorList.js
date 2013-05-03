'use strict';

var Compiler = require('../');

Compiler.prototype.visitKeyframeSelectorList = function(selList) {
	return this.visit(selList.children).join(', ');
};