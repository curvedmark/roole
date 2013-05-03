'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitMediaQueryList = function(mqList) {
	var children = mqList.children;
	return (children.length === 1 ? ' ' : '\n' + this.indent())
		+ this.visit(children).join(',\n' + this.indent());
};