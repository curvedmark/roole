'use strict'

var Evaluator = require('../evaluator')

Evaluator.prototype.visitMediaQuery = function(mediaQueryNode) {
	var childNodes = this.visit(mediaQueryNode.children)

	if (this.interpolatingMediaQuery)
		return childNodes
}