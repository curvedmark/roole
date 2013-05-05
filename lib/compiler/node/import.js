'use strict';

var Compiler = require('../');

Compiler.prototype.visitImport = function(imp) {
	var comments = this.comments(imp);
	var url = this.visit(imp.children[0]);
	var mq = this.visit(imp.children[1]) || '';
	if (mq) mq = ' ' + mq;
	return comments + '@import ' + url + mq + ';';
};