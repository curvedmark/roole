'use strict';

var Node = require('../../node');
var Extender = require('../extender');

Extender.prototype.visitMediaQueryList = function(mediaQueryListNode) {
	if (this.parentMediaQueryList) {
		var childNodes = [];
		var length = this.parentMediaQueryList.children.length;

		this.parentMediaQueryList.children.forEach(function(parentMediaQuery, i) {
			this.parentMediaQuery = parentMediaQuery;

			var mediaQueryListClone = i === length - 1 ?
				mediaQueryListNode :
				Node.clone(mediaQueryListNode);
			childNodes = childNodes.concat(this.visit(mediaQueryListClone.children));
		}, this);

		mediaQueryListNode.children = childNodes;
	} else {
		this.parentMediaQuery = null;
		this.visit(mediaQueryListNode.children);
	}
};