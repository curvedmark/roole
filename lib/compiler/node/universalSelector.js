'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitUniversalSelector = function(universalSelectorNode) {
	return '*'
}