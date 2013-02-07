'use strict'

var Node = require('../../node')

var Compiler = require('../compiler')

Compiler.prototype.visitRange = function(rangeNode) {
	return this.visit(Node.toListNode(rangeNode))
}