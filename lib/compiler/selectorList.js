'use strict';

var Compiler = require('./');

Compiler.prototype.visitSelectorList = function(selList) {
	return this.visit(selList.children).join(',\n' + this.indent());
};