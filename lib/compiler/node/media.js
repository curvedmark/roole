'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitMedia = function(mediaNode) {
	var mediaQueryListNode = mediaNode.children[0]
	var css = '@media'
	css += mediaQueryListNode.children.length > 1 ? '\n' + this.indentString() : ' '
	css += this.visit(mediaQueryListNode) + ' {\n'

	var rulesetListNode = mediaNode.children[1]
	this.indent()
	css += this.indentString() + this.visit(rulesetListNode)
	this.outdent()
	css += '\n' + this.indentString() + '}'

	var ruleListNode = mediaNode.children[2]
	if (ruleListNode) {
		this.indent()
		css += '\n' + this.indentString() + this.visit(ruleListNode)
		this.outdent()
	}

	return css
}