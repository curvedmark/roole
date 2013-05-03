'use strict';

var Evaluator = require('../');

Evaluator.prototype.visitVoid = function(voidNode) {
	this.scope.add();
	this.visit(voidNode.children);
	this.scope.remove();
};