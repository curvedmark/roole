'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitRuleset = function(rulesetNode) {
	var selectorListNode = rulesetNode.children[0]
	var css = this.visit(selectorListNode) + ' {\n'

	var propertyListNode = rulesetNode.children[1]
	this.indent()
	css += this.indentString() + this.visit(propertyListNode)
	this.outdent()
	css += '\n' + this.indentString() + '}'

	var ruleListNode = rulesetNode.children[2]
	if (ruleListNode) {
		this.indent()
		css += '\n' + this.indentString() + this.visit(ruleListNode)
		this.outdent()
	}

	return css
}