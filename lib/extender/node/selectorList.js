'use strict'

var Node = require('../../node')

var Extender = require('../extender')

Extender.prototype.visitSelectorList = function(selectorListNode) {
	selectorListNode.originalNode = Node.clone(selectorListNode)

	var parentSelectorList = this.parentSelectorList

	if (parentSelectorList) {
		var length = parentSelectorList.children.length
		var children = []

		parentSelectorList.children.forEach(function(parentSelector, i) {
			this.parentSelector = parentSelector

			selectorListNode.children.forEach(function(selectorNode) {
				var selectorClone = i === length - 1 ? selectorNode : Node.clone(selectorNode, false)
				children.push(this.visit(selectorNode))
			}, this)
		}, this)

		selectorListNode.children = children
	} else {
		this.parentSelector = null
		this.visit(selectorListNode.children)
	}
}