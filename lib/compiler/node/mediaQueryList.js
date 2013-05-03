'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitMediaQueryList = function(mqList) {
	return this.visit(mqList.children).join(', ');
};