'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitKeyframe = function(keyframe) {
	var sel = this.visit(keyframe.children[0]);
	var ruleList = this.visit(keyframe.children[1]);
	return this.indent() + sel + ' ' + ruleList;
};