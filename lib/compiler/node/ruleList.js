'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitRuleList = function(ruleListNode) {
	return this.visit(ruleListNode.children).join('\n' + this.indentString())
}