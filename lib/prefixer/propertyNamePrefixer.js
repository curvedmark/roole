/**
 * PropertyNamePrefixer
 *
 * Prefix property name
 */
'use strict'

var _ = require('../helper')
var Visitor = require('../visitor')
var Node = require('../node')

var PropertyNamePrefixer = module.exports = function() {}

PropertyNamePrefixer.prototype = new Visitor()

PropertyNamePrefixer.prototype.prefix = function(propertyNameNode, options) {
	this.prefixes = options.prefixes

	return this.visit(propertyNameNode)
}

PropertyNamePrefixer.prototype.visitIdentifier = function(identifierNode) {
	var propertyName = identifierNode.children[0]
	var prefixedPropertyNameNodes = []

	switch (propertyName) {
	case 'box-sizing':
	case 'box-shadow':
	case 'border-radius':
		var prefixes = _.intersect(this.prefixes, ['webkit', 'moz'])
		break
	case 'user-select':
		var prefixes = _.intersect(this.prefixes, ['webkit', 'moz', 'ms'])
		break
	case 'transition-duration':
	case 'transition-property':
	case 'transition':
		var prefixes = _.intersect(this.prefixes, ['webkit', 'moz', 'o'])
		break
	case 'transform':
		var prefixes = this.prefixes
		break
	default:
		return prefixedPropertyNameNodes
	}

	prefixes.forEach(function(prefix) {
		var prefixedPropertyNameNode = Node.clone(identifierNode)
		prefixedPropertyNameNode.children[0] = '-' + prefix + '-' + propertyName
		prefixedPropertyNameNodes.push(prefixedPropertyNameNode)
	})

	return prefixedPropertyNameNodes
}