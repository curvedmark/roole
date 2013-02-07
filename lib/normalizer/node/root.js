'use strict'

var Normalizer = require('../normalizer')

Normalizer.prototype.visitRoot = function(rootNode) {
	var parentRoot = this.parentRoot
	this.parentRoot = rootNode

	var filePath = this.filePath
	this.filePath = rootNode.filePath

	var childNodes = this.visit(rootNode.children)

	this.parentRoot = parentRoot
	this.filePath = filePath

	if (parentRoot && !childNodes.length)
		return null
}