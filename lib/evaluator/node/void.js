'use strict'

var Evaluator = require('../evaluator')

Evaluator.prototype.visitVoid = function(voidNode) {
	this.scope.add()
	this.visit(voidNode.children)
	this.scope.remove()
}