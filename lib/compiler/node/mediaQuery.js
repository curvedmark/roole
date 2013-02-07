'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitMediaQuery = function(mediaQueryNode) {
	return this.visit(mediaQueryNode.children).join(' and ')
}