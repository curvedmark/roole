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

			var selectorListClone = i === length - 1 ? selectorListNode : Node.clone(selectorListNode)
			selectorListClone.children.forEach(function(selectorNode) {
				children.push(this.visit(selectorNode))
			}, this)
		}, this)

		selectorListNode.children = children
	} else {
		this.parentSelector = null
		this.visit(selectorListNode.children)
	}
}