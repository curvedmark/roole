'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitKeyframes = function(keyframes) {
	var prefix = keyframes.children[0] || '';
	if (prefix) prefix = '-' + prefix + '-';

	var name = this.visit(keyframes.children[1]);
	var ruleList = this.visit(keyframes.children[2]);

	return '@' + prefix + 'keyframes ' + name + ' ' + ruleList;
};