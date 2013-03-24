'use strict';

var Err = require('../../err');
var Node = require('../../node');
var Extender = require('../extender');

Extender.prototype.visitAmpersandSelector = function(ampersandSelectorNode) {
	if (!this.parentSelector) {
		throw Err("& selector is not allowed at the top level", ampersandSelectorNode, this.fileName);
	}

	this.hasAmpersandSelector = true;

	var valueNode = ampersandSelectorNode.children[0];
	if (valueNode) {
		var lastNode = this.parentSelector.children[this.parentSelector.children.length - 1];
		switch (lastNode.type) {
		case 'classSelector':
		case 'hashSelector':
		case 'typeSelector':
			break;
		default:
			throw Err("parent selector '" + lastNode.type + "' is not allowed to be appended", ampersandSelectorNode, this.fileName);
		}

		var lastClone = Node.clone(lastNode);
		var identifierNode = lastClone.children[0];
		identifierNode.children[0] += valueNode.children[0];
		var childNodes = this.parentSelector.children.slice(0, -1);
		childNodes.push(lastClone);

		return childNodes;
	}

	return this.parentSelector.children;
};