'use strict';

var MediaFilter = require('../mediaFilter');
var RulesetFilter = require('../rulesetFilter');
var SelectorExtender = require('../selectorExtender');
var Extender = require('../extender');

Extender.prototype.visitExtend = function(extendNode) {
	var nodes = this.extendBoundaryNode.children;

	if (this.parentMediaQueryList) {
		var mediaNodes = new MediaFilter().filter(nodes, this.parentMediaQueryList, options);
		nodes = [];
		mediaNodes.forEach(function(mediaNode) {
			nodes = nodes.concat(mediaNode.children);
		});
	}

	var options = {
		extendNode: extendNode,
		insideVoid: this.insideVoid
	};

	var rulesetNodes = [];
	var selectorListNode = extendNode.children[0];
	selectorListNode.children.forEach(function(selectorNode) {
		rulesetNodes = rulesetNodes.concat(new RulesetFilter().filter(nodes, selectorNode, options));
	});

	rulesetNodes.forEach(function(rulesetNode) {
		new SelectorExtender().extend(rulesetNode, this.parentSelectorList, options);
	}, this);

	return null;
};