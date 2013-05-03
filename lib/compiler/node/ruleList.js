'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitRuleList = function(ruleList) {
	++this.level;
	var css = '{\n' + this.visit(ruleList.children).join('');
	--this.level;
	css += this.indent() + '}';
	css += '\n';

	return  css;
};