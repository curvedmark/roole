'use strict';

var Compiler = require('../');

Compiler.prototype.visitFontFace = function(ff) {
	var comments = this.comments(ff);
	var ruleList = this.visit(ff.children[0]);
	return comments + '@font-face '+ ruleList;
};