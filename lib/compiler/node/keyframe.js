'use strict';

var Compiler = require('../');

Compiler.prototype.visitKeyframe = function(kf) {
	var comments = this.comments(kf);
	var indent = this.indent();
	var sel = this.visit(kf.children[0]);
	var ruleList = this.visit(kf.children[1]);
	return comments + indent + sel + ' ' + ruleList;
};