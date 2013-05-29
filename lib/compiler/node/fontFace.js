'use strict';

module.exports = function(compiler, ff) {
	var comments = compiler.comments(ff);
	var ruleList = compiler.visit(ff.children[0]);
	return comments + '@font-face '+ ruleList;
};