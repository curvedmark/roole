'use strict'

var _ = require('../../helper')
var parser = require('../../parser')

var Evaluator = require('../evaluator')

Evaluator.prototype.visitSelectorInterpolation = function(selectorInterpolationNode) {
	this.visit(selectorInterpolationNode.children)

	var valueNode = selectorInterpolationNode.children[0]
	if (valueNode.type !== 'string') {
		selectorInterpolationNode.type = 'typeSelector'
		return
	}

	var value = valueNode.children[0].trim()
	var options = {
		filePath: this.filePath,
		_startRule: 'selector',
		_loc: {
			line: valueNode.loc.line,
			column: valueNode.loc.column,
			offset: valueNode.loc.offset
		}
	}
	try{
		var selectorNode = parser.parse(value, options)
	} catch (error) {
		error.message = 'error parsing selector interpolation: ' + error.message
		throw error
	}

	this.interpolatingSelector = true
	selectorNode = this.visit(selectorNode)
	this.interpolatingSelector = false

	return selectorNode
}