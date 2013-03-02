/**
 * Selector Extender
 *
 * Extend passed rulesets with the passed parent selectors
 */
'use strict'

var _ = require('../helper')
var Node = require('../node')
var Visitor = require('../visitor')
var Extender = require('./extender')

var SelectorExtender = module.exports = function() {}

SelectorExtender.stop = {}

SelectorExtender.prototype = new Visitor()

SelectorExtender.prototype.extend = function(rulesetNode, parentSelectors, options) {
	this.parentSelectors = parentSelectors
	this.extendNode = options.extendNode
	this.insideVoid = options.insideVoid

	var selectorListNode = rulesetNode.children[0]
	selectorListNode.children = selectorListNode.children.concat(parentSelectors)

	if (!this.insideVoid) {
		if (!selectorListNode.extendedSelectors)
			selectorListNode.extendedSelectors = parentSelectors
		else
			selectorListNode.extendedSelectors = selectorListNode.extendedSelectors.concat(parentSelectors)
	}

	var ruleListNode = rulesetNode.children[1]

	try {
		this.visit(ruleListNode)
	} catch (error) {
		if (error !== SelectorExtender.stop)
			throw error
	}
}

SelectorExtender.prototype.visitRoot =
SelectorExtender.prototype.visitMedia =
SelectorExtender.prototype.visitRuleList = SelectorExtender.prototype.visitNode

SelectorExtender.prototype.visitNode = _.noop

SelectorExtender.prototype.visitExtend = function(extendNode) {
	if (extendNode === this.extendNode)
		throw SelectorExtender.stop
}

SelectorExtender.prototype.visitRuleset = function(rulesetNode) {
	var selectorListNode = this.visit(rulesetNode.children[0])

	var parentSelectors = this.parentSelectors
	this.parentSelectors = selectorListNode.children

	var ruleListNode = rulesetNode.children[1]
	this.visit(ruleListNode)

	this.parentSelectors = parentSelectors
}

SelectorExtender.prototype.visitSelectorList = function(selectorListNode) {
	var selectorListClone = Node.clone(selectorListNode.originalNode, false)

	var extender = new Extender()
	extender.parentSelectors = this.parentSelectors
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