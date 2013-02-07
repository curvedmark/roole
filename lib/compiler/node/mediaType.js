'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitMediaType = function(mediaTypeNode) {
	var modifier = mediaTypeNode.children[0]
	if (!modifier)
		mediaTypeNode.children.shift()

	return this.visit(mediaTypeNode.children).join(' ')
}