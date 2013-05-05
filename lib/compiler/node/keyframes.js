'use strict';

var Compiler = require('../');

Compiler.prototype.visitKeyframes = function(kfs) {
	var comments = this.comments(kfs);
	var prefix = kfs.prefix || '';
	if (prefix) prefix = '-' + prefix + '-';
	var name = this.visit(kfs.children[0]);
	var ruleList = this.visit(kfs.children[1]);
	return comments + '@' + prefix + 'keyframes ' + name + ' ' + ruleList;
};