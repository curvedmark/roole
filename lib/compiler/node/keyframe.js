'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitKeyframe = function(keyframeNode) {
	var css = this.visit(keyframeNode.children[0]) + ' {\n'
	this.indent()
	css += this.indentString() + this.visit(keyframeNode.children[1])
	this.outdent()
	css += '\n' + this.indentString() + '}'

	return css
}