'use strict'

var _ = require('../helper')
var Visitor = require('../visitor')
var Node = require('../node')

var LinearGradientPrefixer = module.exports = function() {}

LinearGradientPrefixer.stop = {}

LinearGradientPrefixer.prototype = new Visitor()

LinearGradientPrefixer.prototype.prefix = function(propertyValueNode, options) {
	var prefixes = _.intersect(options.prefixes, ['webkit', 'moz', 'o'])

	var prefixedPropertyValueNodes = []

	this.hasLinearGradient = false
	try {
		this.visit(propertyValueNode)
	} catch (error) {
		if (error !== LinearGradientPrefixer.stop)
			throw err
	}
	if (!this.hasLinearGradient)
		return prefixedPropertyValueNodes

	prefixes.forEach(function(prefix) {
		this.currentPrefix = prefix

		var propertyValueClone = Node.clone(propertyValueNode)
		var prefixedPropertyValueNode = this.visit(propertyValueClone)

		prefixedPropertyValueNodes.push(prefixedPropertyValueNode)
	}, this)

	return prefixedPropertyValueNodes
}

LinearGradientPrefixer.prototype.visitFunction = function(functionNode) {
	var functionName = functionNode.children[0]

	if (functionName !== 'linear-gradient')
		return

	if (!this.hasLinearGradient) {
		this.hasLinearGradient = true
		throw LinearGradientPrefixer.stop
	}

	functionNode.children[0] = '-' + this.currentPrefix + '-' + functionName

	var argumentListNode = functionNode.children[1]

	var firstArgumentNode = argumentListNode.children[0]
	if (firstArgumentNode.type !== 'list')
		return

	var firstListItemNode = firstArgumentNode.children[0]
	if (firstListItemNode.type !== 'identifier' || firstListItemNode.children[0] !== 'to')
		return

	var positionNodes = firstArgumentNode.children.slice(2)
	firstArgumentNode.children = positionNodes.map(function(positionNode) {
		if (positionNode.type !== 'identifier')
			return positionNode

		var positionName = positionNode.children[0]
		switch (positionName) {
		case 'top':
			positionName = 'bottom'
			break
		case 'bottom':
			positionName = 'top'
			break
		case 'left':
			positionName = 'right'
			break
		case 'right':
			positionName = 'left'
			break
		}
		positionNode.children[0] = positionName

		return positionNode
	})
}