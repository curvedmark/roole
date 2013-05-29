'use strict';

module.exports = function(compiler, ruleset) {
	var level = compiler.level;
	compiler.level += ruleset.level || 0;
	var indent = compiler.indent();
	var comments = compiler.comments(ruleset);
	var selList = compiler.visit(ruleset.children[0]);
	var ruleList = compiler.visit(ruleset.children[1]);
	compiler.level = level;
	return comments + indent + selList + ' ' + ruleList;
};