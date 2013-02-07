'use strict'

var Evaluator = require('../evaluator')

Evaluator.prototype.visitParameter = function(parameterNode) {
	var defaultValueNode = parameterNode.children[1]
	parameterNode.children[1] = this.visit(defaultValueNode)
}