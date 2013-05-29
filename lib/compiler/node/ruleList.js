'use strict';

module.exports = function(compiler, ruleList) {
	++compiler.level;
	var rules = compiler.visit(ruleList.children).join('\n');
	--compiler.level;
	return '{\n' + rules + '\n' + compiler.indent() + '}';
};