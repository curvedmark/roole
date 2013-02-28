'use strict'

var MediaFilter = require('../mediaFilter')
var RulesetExtender = require('../rulesetExtender')

var Extender = require('../extender')

Extender.prototype.visitExtend = function(extendNode) {
	var nodes = this.extendBoundaryNode.children
	var options = {
		extendNode: extendNode,
		insideVoid: !!this.parentVoid
	}

	var parentMediaQueryList = this.parentMediaQueryList
	if (parentMediaQueryList) {
		var mediaNodes = new MediaFilter().filter(nodes, parentMediaQueryList, options)
		nodes = []
		mediaNodes.forEach(function(mediaNode) {
			nodes = nodes.concat(mediaNode.children)
		})
	}

	var parentSelectorList = this.parentSelectorList
	var selectorListNode = extendNode.children[0]
	selectorListNode.children.forEach(function(selectorNode) {
		new RulesetExtender().extend(nodes, selectorNode, parentSelectorList, options)
	})

	return null
}