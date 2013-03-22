'use strict';

var Node = require('../../node');
var Extender = require('../extender');

Extender.prototype.visitSelectorList = function(selectorListNode) {
	var selectorListClone = Node.clone(selectorListNode);
	selectorListNode.originalNode = selectorListClone;

	if (this.parentSelectorList) {
		var childNodes = [];
		var length = this.parentSelectorList.children.length;

		this.parentSelectorList.children.forEach(function(parentSelector, i) {
			this.parentSelector = parentSelector;

			var selectorListClone = i === length - 1 ?
				selectorListNode :
				Node.clone(selectorListNode);
			childNodes = childNodes.concat(this.visit(selectorListClone.children));
		}, this);

		selectorListNode.children = childNodes;
	} else {
		this.parentSelector = null;
		this.visit(selectorListNode.children);
	}
};