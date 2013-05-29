'use strict';

var Node = require('../../node');
module.exports = function(compiler, range) {
	return compiler.visit(Node.toListNode(range));
};