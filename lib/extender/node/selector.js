'use strict';

var Err = require('../../err');
var Node = require('../../node');
var Extender = require('../extender');

Extender.prototype.visitSelector = function(selectorNode) {
	this.visit(selectorNode.children);

	if (this.hasAmpersandSelector) {
		this.hasAmpersandSelector = false;
		return;
	}

	var firstNode = selectorNode.children[0];
	var startWithCombinator = firstNode.type === 'combinator';
	if (startWithCombinator) {
		if (!this.parentSelector) {
			throw Err("selector starting with a combinator is not allowed at the top level", firstNode, this.filename);
		}

		selectorNode.children = this.parentSelector.children.concat(selectorNode.children);
	} else if (this.parentSelector) {
		var combinator = Node('combinator', [' '], {loc: selectorNode.loc});
		selectorNode.children = this.parentSelector.children.concat(combinator, selectorNode.children);
	}
};