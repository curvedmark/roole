'use strict';

module.exports = function (compiler, stylesheet) {
	var comments = compiler.comments(stylesheet);
	var rules = stylesheet.children.reduce(function (css, child, i) {
		var str = compiler.visit(child);
		if (!child.level && i) css += '\n';
		return css + str + '\n';
	}, '');
	return comments + rules;
};