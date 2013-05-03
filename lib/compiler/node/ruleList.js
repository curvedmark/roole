'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitRuleList = function(ruleList) {
	++this.level;

	var rules = this.visit(ruleList.children).join('\n');

	--this.level;
	return '{\n' + rules + '\n' + this.indent() + '}';
};