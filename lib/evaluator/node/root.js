'use strict'

var Evaluator = require('../evaluator')

Evaluator.prototype.visitRoot = function(rootNode) {
	var filePath = this.filePath
	this.filePath = rootNode.filePath

	this.visit(rootNode.children)

	this.filePath = filePath
}