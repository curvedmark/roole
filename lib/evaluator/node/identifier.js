'use strict'

var Err = require('../../err')
var Node = require('../../node')
var compiler = require('../../compiler')

var Evaluator = require('../evaluator')

Evaluator.prototype.visitIdentifier = function(identifierNode) {
	var childNodes = this.visit(identifierNode.children)

	var that = this
	var value = childNodes.reduce(function(value, childNode) {
		if (typeof childNode === 'string')
			return value + childNode

		switch (childNode.type) {
		case 'mixin':
			throw Err("'mixin' is not allowed to be interpolated", childNode, that.filePath)
		case 'string':
		case 'identifier':
		case 'number':
			return value + childNode.children[0]
		default:
			return value + compiler.compile(childNode)
		}
	}, '')

	identifierNode.children = [value]
}