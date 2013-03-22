/**
 * Selector Extender
 *
 * Extend selectors in the passed ruleset with the passed parent selectors
 */
'use strict';

var _ = require('../helper');
var Node = require('../node');
var Visitor = require('../visitor');
var Extender = require('./extender');

var SelectorExtender = module.exports = function() {};

SelectorExtender.stop = {};

SelectorExtender.prototype = new Visitor();

SelectorExtender.prototype.extend = function(rulesetNode, parentSelectorList, options) {
	this.parentSelectorList = parentSelectorList;
	this.extendNode = options.extendNode;
	this.insideVoid = options.insideVoid;

	var selectorListNode = rulesetNode.children[0];
	selectorListNode.children = selectorListNode.children.concat(parentSelectorList.children);

	if (!this.insideVoid) {
		selectorListNode.extendedSelectors = selectorListNode.extendedSelectors ?
			selectorListNode.extendedSelectors.concat(parentSelectorList.children) :
			parentSelectorList.children;
	}

	var ruleListNode = rulesetNode.children[1];

	try {
		this.visit(ruleListNode);
	} catch (error) {
		if (error !== SelectorExtender.stop) {
			throw error;
		}
	}
};

SelectorExtender.prototype.visitRoot =
SelectorExtender.prototype.visitMedia =
SelectorExtender.prototype.visitRuleList = SelectorExtender.prototype.visitNode;

SelectorExtender.prototype.visitNode = _.noop;

SelectorExtender.prototype.visitExtend = function(extendNode) {
	if (extendNode === this.extendNode) {
		throw SelectorExtender.stop;
	}
};

SelectorExtender.prototype.visitRuleset = function(rulesetNode) {
	var selectorListNode = this.visit(rulesetNode.children[0]);

	var parentSelectorList = this.parentSelectorList;
	this.parentSelectorList = selectorListNode;

	var ruleListNode = rulesetNode.children[1];
	this.visit(ruleListNode);

	this.parentSelectorList = parentSelectorList;
};

SelectorExtender.prototype.visitSelectorList = function(selectorListNode) {
	var selectorListClone = Node.clone(selectorListNode.originalNode);

	var extender = new Extender();
	extender.parentSelectorList = this.parentSelectorList;
	selectorListClone = extender.extend(selectorListClone, this.options);

	selectorListNode.children = selectorListNode.children.concat(selectorListClone.children);

	if (!this.insideVoid) {
		selectorListNode.extendedSelectors = selectorListNode.extendedSelectors ?
			selectorListNode.extendedSelectors.concat(selectorListClone.children) :
			selectorListClone.children;
	}

	return selectorListClone;
};