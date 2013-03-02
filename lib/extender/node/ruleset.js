'use strict'

var Extender = require('../extender')

Extender.prototype.visitRuleset = function(rulesetNode) {
	var selectorListNode = this.visit(rulesetNode.children[0])

	var parentSelectors = this.parentSelectors
	this.parentSelectors = selectorListNode.children

	this.visit(rulesetNode.children[1])

	this.parentSelectors = parentSelectors
}