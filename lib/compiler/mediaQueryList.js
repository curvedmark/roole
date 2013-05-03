'use strict';

var Compiler = require('./');

Compiler.prototype.visitMediaQueryList = function(mqList) {
	return this.visit(mqList.children).join(', ');
};