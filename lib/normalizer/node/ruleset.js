'use strict';

var Node = require('../../node');
var Normalizer = require('../normalizer');

Normalizer.prototype.visitRuleset = function(rulesetNode) {
	var selectorListNode = rulesetNode.children[0];

	if (this.insideVoid) {
		if (!selectorListNode.extendedSelectors) {
			return null;
		}

		selectorListNode.children = selectorListNode.extendedSelectors;
	}

	var parentSelectorList = this.parentSelectorList;
	this.parentSelectorList = selectorListNode;

	var ruleListNode = this.visit(rulesetNode.children[1]);

	this.parentSelectorList = parentSelectorList;

	var propertyNodes = [];
	var otherNodes = [];

	ruleListNode.children.forEach(function(childNode) {
		if (childNode.type === 'property') {
			propertyNodes.push(childNode);
		} else {
			otherNodes.push(childNode);
		}
	});

	if (!propertyNodes.length) {
		return otherNodes;
	}

	var firstPropertyNode = propertyNodes[0];
	var propertyListNode = Node('ruleList', propertyNodes, {loc: firstPropertyNode.loc});

	// bubble child medias if under a media
	var mediaNodes;
	if (this.parentMedia) {
		mediaNodes = [];
		var others = [];
		otherNodes.forEach(function(node) {
			if (node.type === 'media') {
				mediaNodes.push(node);
			} else {
				others.push(node);
			}
		});
		otherNodes = others;
	}

	if (!otherNodes.length) {
		ruleListNode = null;
	} else {
		ruleListNode.children = otherNodes;
	}

	rulesetNode.children = [selectorListNode, propertyListNode, ruleListNode];

	if (this.parentMedia && mediaNodes.length) {
		return [rulesetNode].concat(mediaNodes);
	}
};