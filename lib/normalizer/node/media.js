'use strict'

var Err = require('../../err')
var Node = require('../../node')

var Normalizer = require('../normalizer')

Normalizer.prototype.visitMedia = function(mediaNode) {
	var mediaQueryListNode = mediaNode.children[0]

	var parentMedia = this.parentMedia
	this.parentMedia = mediaNode

	var ruleListNode = this.visit(mediaNode.children[1])

	this.parentMedia = parentMedia

	var propertyNodes = []
	var rulesetNodes = []
	var otherNodes = []

	ruleListNode.children.forEach(function(childNode) {
		switch (childNode.type) {
		case 'property':
			propertyNodes.push(childNode)
			break
		case 'ruleset':
			rulesetNodes.push(childNode)
			break
		default:
			otherNodes.push(childNode)
		}
	})

	if (propertyNodes.length) {
		if (!this.parentSelectorList)
			throw Err("@media containing properties is not allowed at the top level", mediaNode, this.filePath)

		var firstPropertyNode = propertyNodes[0]
		var propertyList = Node('propertyList', propertyNodes, {loc: firstPropertyNode.loc})

		var rulesetChildNodes = [this.parentSelectorList, propertyList, null]
		var rulesetNode = Node('ruleset', rulesetChildNodes, {loc: this.parentSelectorList.loc})
		rulesetNodes.unshift(rulesetNode)
	}

	if (!rulesetNodes.length)
		return otherNodes

	var firstRulesetNode = rulesetNodes[0]
	var rulesetListNode = Node('rulesetList', rulesetNodes, {loc: firstRulesetNode.loc})

	if (!otherNodes.length)
		ruleListNode = null
	else
		ruleListNode.children = otherNodes

	mediaNode.children = [mediaQueryListNode, rulesetListNode, ruleListNode]
}