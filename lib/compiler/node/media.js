'use strict';

module.exports = function(compiler, media) {
	var level = compiler.level;
	compiler.level += media.level || 0;

	var comments = compiler.comments(media);
	var indent = compiler.indent();
	var mqList = media.children[0];
	var mqs = mqList.children;
	mqList = compiler.visit(mqs).join(',\n' + compiler.indent());
	mqList = (mqs.length === 1 ? ' ' : '\n' + compiler.indent()) + mqList;
	var ruleList = compiler.visit(media.children[1]);

	compiler.level = level;
	return comments + indent + '@media' + mqList + ' ' + ruleList;
};