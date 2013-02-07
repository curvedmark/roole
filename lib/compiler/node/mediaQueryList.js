'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitMediaQueryList = function(mediaQueryListNode) {
	return this.visit(mediaQueryListNode.children).join(',\n' + this.indentString())
}