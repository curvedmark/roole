'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitProperty = function(propertyNode) {
	var css = this.visit(propertyNode.children[0]) + ': ' +  this.visit(propertyNode.children[1])

	var priority = propertyNode.children[2]
	if (priority)
		css += ' ' + priority

	return css
}