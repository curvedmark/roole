'use strict'

var Evaluator = require('../evaluator')

Evaluator.prototype.visitSelector = function(selectorNode) {
	var childNodes = this.visit(selectorNode.children)

	if (this.interpolatingSelector)
		return childNodes
}