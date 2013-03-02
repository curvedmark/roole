'use strict'

var Node = require('../../node')

var Extender = require('../extender')

Extender.prototype.visitSelectorList = function(selectorListNode) {
	var selectorListClone = Node.clone(selectorListNode, false)
	selectorListClone.children = selectorListNode.children
	selectorListNode.originalNode = selectorListClone

	var selectors = []
	if (this.parentSelectors) {
		this.parentSelectors.forEach(function(parentSelector) {
			this.parentSelector = parentSelector

			selectorListNode.children.forEach(function(selectorNode) {
				selectors.push(this.visit(selectorNode))
			}, this)
		}, this)
	} else {
		this.parentSelector = ''
		selectorListNode.children.forEach(function(selectorNode) {
			selectors.push(this.visit(selectorNode))
		}, this)
	}

	selectorListNode.children = selectors
}