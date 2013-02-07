'use strict'

var Normalizer = require('../normalizer')

Normalizer.prototype.visitVoid = function(voidNode) {
	var parentVoid = this.parentVoid
	this.parentVoid = voidNode

	var ruleListNode = voidNode.children[0]
	this.visit(ruleListNode)

	this.parentVoid = parentVoid

	return ruleListNode.children
}