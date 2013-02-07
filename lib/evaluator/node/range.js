'use strict'

var Err = require('../../err')
var Node = require('../../node')

var Evaluator = require('../evaluator')

Evaluator.prototype.visitRange = function(rangeNode) {
	this.visit(rangeNode.children)

	var fromNode = rangeNode.children[0]
	var toNode = rangeNode.children[1]

	var invalidNode
	if (Node.toNumber(fromNode) === null)
		invalidNode = fromNode
	else if (Node.toNumber(toNode) === null)
		invalidNode = toNode

	if (invalidNode)
		throw Err("only numberic values are allowed in 'range'", invalidNode, this.filePath)
}