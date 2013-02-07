'use strict'

var _ = require('../../helper')
var parser = require('../../parser')

var Evaluator = require('../evaluator')

Evaluator.prototype.visitMediaInterpolation = function(mediaInterpolationNode) {
	this.visit(mediaInterpolationNode.children)

	var valueNode = mediaInterpolationNode.children[0]
	if (valueNode.type !== 'string') {
		mediaInterpolationNode.children.unshift(null)
		mediaInterpolationNode.type = 'mediaType'
		return
	}

	var value = valueNode.children[0].trim()
	var options = {
		filePath: this.filePath,
		_startRule: 'mediaQuery',
		_loc: {
			line: valueNode.loc.line,
			column: valueNode.loc.column,
			offset: valueNode.loc.offset
		}
	}
	try{
		var mediaQueryNode = parser.parse(value, options)
	} catch (error) {
		error.message = 'error parsing media query interpolation: ' + error.message
		throw error
	}

	this.interpolatingMediaQuery = true
	mediaQueryNode = this.visit(mediaQueryNode)
	this.interpolatingMediaQuery = false

	return mediaQueryNode
}