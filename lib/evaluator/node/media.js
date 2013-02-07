'use strict'

var Evaluator = require('../evaluator')

Evaluator.prototype.visitMedia = function(mediaNode) {
	this.visit(mediaNode.children[0])

	this.scope.add()
	var ruleListNode = this.visit(mediaNode.children[1])
	this.scope.remove()

	if (!ruleListNode.children.length)
		return null
}