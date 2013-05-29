'use strict';

module.exports = function(compiler, kf) {
	var comments = compiler.comments(kf);
	var indent = compiler.indent();
	var sel = compiler.visit(kf.children[0]);
	var ruleList = compiler.visit(kf.children[1]);
	return comments + indent + sel + ' ' + ruleList;
};