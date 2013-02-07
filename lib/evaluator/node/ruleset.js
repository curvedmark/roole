'use strict'

var Evaluator = require('../evaluator')

Evaluator.prototype.visitRuleset = function(rulesetNode) {
	this.visit(rulesetNode.children[0])

	this.scope.add()

	var ruleListNode = this.visit(rulesetNode.children[1])

	this.scope.remove()

	if (!ruleListNode.children.length)
		return null
}