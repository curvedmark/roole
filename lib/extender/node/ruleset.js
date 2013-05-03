'use strict';

var Extender = require('../');

Extender.prototype.visitRuleset = function(rulesetNode) {
	var selectorListNode = this.visit(rulesetNode.children[0]);

	var parentSelectorList = this.parentSelectorList;
	this.parentSelectorList = selectorListNode;

	this.visit(rulesetNode.children[1]);

	this.parentSelectorList = parentSelectorList;
};