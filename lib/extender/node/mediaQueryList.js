'use strict'

var Node = require('../../node')

var Extender = require('../extender')

Extender.prototype.visitMediaQueryList = function(mediaQueryListNode) {
	var parentMediaQueryList = this.parentMediaQueryList

	if (parentMediaQueryList) {
		var length = parentMediaQueryList.children.length
		var children = []

		parentMediaQueryList.children.forEach(function(parentMediaQuery, i) {
			this.parentMediaQuery = parentMediaQuery

			var mediaQueryListClone = i === length - 1 ? mediaQueryListNode : Node.clone(mediaQueryListNode)
			mediaQueryListClone.children.forEach(function(selectorNode) {
				children.push(this.visit(selectorNode))
			}, this)
		}, this)

		mediaQueryListNode.children = children
	} else {
		this.parentMediaQuery = null
		this.visit(mediaQueryListNode.children)
	}
}