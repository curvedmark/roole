'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitKeyframe = function(keyframeNode) {
	return this.visit(keyframeNode.children[0]) + ' '
	     + this.visit(keyframeNode.children[1]);
};