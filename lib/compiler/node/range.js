'use strict';

var Node = require('../../node');
var Compiler = require('../');

Compiler.prototype.visitRange = function(range) {
	return this.visit(Node.toListNode(range));
};