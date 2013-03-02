'use strict'

var Extender = require('../extender')

Extender.prototype.visitVoid = function(voidNode) {
	var parentVoid = this.parentVoid
	this.parentVoid = voidNode

	var extendBoundaryNode = this.extendBoundaryNode
	this.extendBoundaryNode = voidNode

	this.visit(voidNode.children)

	this.parentVoid = parentVoid
	this.extendBoundaryNode = extendBoundaryNode
}