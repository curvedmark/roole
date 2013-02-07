'use strict'

var Evaluator = require('../evaluator')

Evaluator.prototype.visitMixin = function(mixinNode) {
	var parameterList = mixinNode.children[0]
	this.visit(parameterList)
}