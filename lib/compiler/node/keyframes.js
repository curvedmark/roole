'use strict';

var Compiler = require('../');

Compiler.prototype.visitKeyframes = function(keyframes) {
	var prefix = keyframes.prefix || '';
	if (prefix) prefix = '-' + prefix + '-';
	var name = this.visit(keyframes.children[0]);
	var ruleList = this.visit(keyframes.children[1]);
	return '@' + prefix + 'keyframes ' + name + ' ' + ruleList;
};