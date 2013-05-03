'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitRuleset = function(rulesetNode) {
	var level = this.level;
	this.level += rulesetNode.level;

	var selectorListNode = rulesetNode.children[0];
	var css = this.visit(selectorListNode) + ' ';
	var propertyListNode = rulesetNode.children[1];
	css += this.visit(propertyListNode);

	this.level = level;
	return css;
};