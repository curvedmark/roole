'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitMedia = function(mediaNode) {
	var level = mediaNode.level;
	this.level = mediaNode.level;

	var css = this.indent() + '@media';
	var mediaQueryListNode = mediaNode.children[0];
	css += this.visit(mediaQueryListNode) + ' ';
	var rulesetListNode = mediaNode.children[1];
	css += this.visit(rulesetListNode);

	this.level = level;
	return css;
};