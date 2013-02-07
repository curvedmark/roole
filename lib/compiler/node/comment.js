'use strict'

var Compiler = require('../compiler')

Compiler.prototype.visitComment = function(commentNode) {
	return '/*' + commentNode.children[0] + '*/'
}