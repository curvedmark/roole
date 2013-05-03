'use strict';

var Compiler = require('../');

Compiler.prototype.visitMedia = function(media) {
	var level = this.level;
	this.level += media.level || 0;

	var indent = this.indent();
	var mqList = media.children[0];
	var mqs = mqList.children;
	mqList = this.visit(mqs).join(',\n' + this.indent());
	mqList = (mqs.length === 1 ? ' ' : '\n' + this.indent()) + mqList;
	var ruleList = this.visit(media.children[1]);

	this.level = level;
	return indent + '@media' + mqList + ' ' + ruleList;
};