'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitUrl = function(urlNode) {
	return 'url(' + this.visit(urlNode.children[0]) + ')'
}