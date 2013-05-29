'use strict';

module.exports = function(compiler, kfs) {
	var comments = compiler.comments(kfs);
	var prefix = kfs.prefix || '';
	if (prefix) prefix = '-' + prefix + '-';
	var name = compiler.visit(kfs.children[0]);
	var ruleList = compiler.visit(kfs.children[1]);
	return comments + '@' + prefix + 'keyframes ' + name + ' ' + ruleList;
};