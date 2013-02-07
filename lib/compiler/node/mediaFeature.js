'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitMediaFeature = function(mediaFeatureNode) {
	this.visit(mediaFeatureNode.children)
	var name = mediaFeatureNode.children[0]
	var value = mediaFeatureNode.children[1]

	return '(' + name + (value ? ': ' + value : '') + ')'
}