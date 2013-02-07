'use strict'

var Node = require('../../node')

var Evaluator = require('../evaluator')

Evaluator.prototype.visitIf = function(ifNode) {
	var conditionNode = this.visit(ifNode.children[0])

	if (Node.toBoolean(conditionNode)) {
		var ruleListNode = ifNode.children[1]
		return this.visit(ruleListNode.children)
	}

	var alternativeNode = ifNode.children[2]
	if (!alternativeNode)
		return null

	if (alternativeNode.type === 'if')
		return this.visit(alternativeNode)

	return this.visit(alternativeNode.children)
}