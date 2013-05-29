'use strict';

module.exports = function(compiler, page) {
	var comments = compiler.comments(page);
	var name = compiler.visit(page.children[0]) || '';
	if (name) name = ' :' + name;
	var ruleList = compiler.visit(page.children[1]);
	return comments + '@page' + name + ' ' + ruleList;
};