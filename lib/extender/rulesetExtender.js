/**
 * Selector Extender
 *
 * Extend all selectors exsiting before the passed extend node with
 * the passed selector list node
 */
'use strict'

var _ = require('../helper')
var Node = require('../node')
var Visitor = require('../visitor')
var Extender = require('./extender')

var RulesetExtender = module.exports = function() {}

RulesetExtender.stop = {}

RulesetExtender.prototype = new Visitor()
RulesetExtender.prototype.constructor = RulesetExtender

RulesetExtender.prototype.extend = function(rulesetNode, parentSelectorList, options) {
	this.parentSelectorList = parentSelectorList
	this.extendNode = options.extendNode
	this.insideVoid = options.insideVoid

	var selectorListNode = rulesetNode.children[0]
	selectorListNode.children = selectorListNode.children.concat(parentSelectorList.children)

	if (!this.insideVoid) {
		if (!selectorListNode.extendedSelectors)
			selectorListNode.extendedSelectors = parentSelectorList.children
		else
			selectorListNode.extendedSelectors = selectorListNode.extendedSelectors.concat(parentSelectorList.children)
	}

	var ruleListNode = rulesetNode.children[1]

	try {
		this.visit(ruleListNode)
	} catch (error) {
		if (error !== RulesetExtender.stop)
			throw error
	}
}

RulesetExtender.prototype.visitRoot =
RulesetExtender.prototype.visitMedia =
RulesetExtender.prototype.visitRuleList = RulesetExtender.prototype.visitNode

RulesetExtender.prototype.visitNode = _.noop

RulesetExtender.prototype.visitExtend = function(extendNode) {
	if (extendNode === this.extendNode)
		throw RulesetExtender.stop
}

RulesetExtender.prototype.visitRuleset = function(rulesetNode) {
	var selectorListNode = this.visit(rulesetNode.children[0])

	var parentSelectorList = this.parentSelectorList
	this.parentSelectorList = selectorListNode

	var ruleListNode = rulesetNode.children[1]
	this.visit(ruleListNode)

	this.parentSelectorList = parentSelectorList
}

RulesetExtender.prototype.visitSelectorList = function(selectorListNode) {
	var selectorListClone = Node.clone(selectorListNode.originalNode)

	var extender = new Extender()
	extender.parentSelectorList = this.parentSelectorList
	selectorListClone = extender.extend(selectorListClone, this.options)

	selectorListNode.children = selectorListNode.children.concat(selectorListClone.children)

	if (!this.insideVoid) {
		if (!selectorListNode.extendedSelectors)
			selectorListNode.extendedSelectors = selectorListClone.children
		else
			selectorListNode.extendedSelectors = selectorListNode.extendedSelectors.concat(selectorListClone.children)
	}

	return selectorListClone
}