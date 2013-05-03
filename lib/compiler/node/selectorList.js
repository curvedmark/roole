'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitSelectorList = function(selList) {
	return this.visit(selList.children).join(',\n' + this.indent());
};