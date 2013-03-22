'use strict';

var Extender = require('../extender');

Extender.prototype.visitMedia = function(mediaNode) {
	var mediaQueryListNode = this.visit(mediaNode.children[0]);

	var parentMediaQueryList = this.parentMediaQueryList;
	this.parentMediaQueryList = mediaQueryListNode;

	this.visit(mediaNode.children[1]);

	this.parentMediaQueryList = parentMediaQueryList;
};