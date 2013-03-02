'use strict'

var MediaFilter = require('../mediaFilter')
var RulesetExtender = require('../rulesetExtender')
var compiler = require('../../compiler')

var Extender = require('../extender')

Extender.prototype.visitExtend = function(extendNode) {
	var nodes = this.extendBoundaryNode.children
	var options = {
		extendNode: extendNode,
		insideVoid: !!this.parentVoid
	}

	if (this.parentMediaQueries) {
		var mediaNodes = new MediaFilter().filter(nodes, this.parentMediaQueries, options)
		nodes = []
		mediaNodes.forEach(function(mediaNode) {
			nodes = nodes.concat(mediaNode.children)
		})
	}

	var selectorListNode = extendNode.children[0]
	selectorListNode.children.forEach(function(selectorNode) {
		selectorNode = compiler.compile(selectorNode)
		new RulesetExtender().extend(nodes, selectorNode, this.parentSelectors, options)
	}, this)

	return null
}