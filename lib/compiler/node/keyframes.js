'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitKeyframes = function(keyframesNode) {
	var css = '@'

	var prefix = keyframesNode.children[0]
	if (prefix)
		css += '-' + prefix + '-'

	var nameNode = keyframesNode.children[1]
	css += 'keyframes ' + this.visit(nameNode) + ' {\n'

	var ruleListNode = keyframesNode.children[2]
	this.indent()
	css += this.indentString() + this.visit(ruleListNode)
	this.outdent()
	css += '\n' + this.indentString() + '}'

	return css
}