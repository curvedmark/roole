'use strict';

var Compiler = require('./');

Compiler.prototype.visitComment = function(commentNode) {
	return '/*' + commentNode.children[0] + '*/';
};