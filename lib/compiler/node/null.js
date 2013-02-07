'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitNull = function(nullNode) {
	return 'null'
}