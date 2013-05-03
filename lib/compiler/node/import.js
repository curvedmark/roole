'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitImport = function(importNode) {
	var url = this.visit(importNode.children[0]);
	var mq = this.visit(importNode.children[1]) || '';
	if (mq) mq = ' ' + mq;
	return '@import ' + url + mq + ';';
};