'use strict'

var Err = require('../../err')
var Node = require('../../node')
var compiler = require('../../compiler')

var Evaluator = require('../evaluator')

Evaluator.prototype.visitString = function(stringNode) {
	if (stringNode.quote === "'")
		return stringNode

	var childNodes = this.visit(stringNode.children)

	var that = this
	var value = childNodes.reduce(function(value, childNode) {
		if (typeof childNode === 'string')
			return value + childNode

		switch (childNode.type) {
		case 'mixin':
			throw Err("'mixin' is not allowed to be interpolated", childNode, that.filePath)
		case 'identifier':
		case 'number':
			return value + childNode.children[0]
		case 'string':
			return value + childNode.children[0].replace(/\\?"/g, function(quote) {
				return quote.length === 1 ? '\\"' : quote
			})
		default:
			return value + compiler.compile(childNode)
		}
	}, '')

	stringNode.children = [value]
}