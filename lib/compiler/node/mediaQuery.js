'use strict';

var Compiler = require('../');

Compiler.prototype.visitMediaQuery = function(mq) {
	return this.visit(mq.children).join(' and ');
};