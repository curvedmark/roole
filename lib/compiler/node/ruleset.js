'use strict';

var Compiler = require('../');

Compiler.prototype.visitRuleset = function(ruleset) {
	var level = this.level;
	this.level += ruleset.level || 0;

	var indent = this.indent();
	var comments = this.comments(ruleset);
	var selList = this.visit(ruleset.children[0]);
	var ruleList = this.visit(ruleset.children[1]);

	this.level = level;
	return comments + indent + selList + ' ' + ruleList;
};