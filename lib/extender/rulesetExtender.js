/**
 * Media Filter
 *
 * Find ruleset nodes existing before the passed extend node
 * and matching the passed selector node
 */
'use strict'

var _ = require('../helper')
var Node = require('../node')
var Visitor = require('../visitor')
var SelectorExtender = require('./SelectorExtender')

var RulesetExtender = module.exports = function() {}

RulesetExtender.stop = {}

RulesetExtender.prototype = new Visitor()

RulesetExtender.prototype.extend = function(ast, selectorNode, parentSelectorList, options) {
	this.parentSelectorList = parentSelectorList
	this.selectorNode = selectorNode
	this.extendNode = options.extendNode
	this.options = options

	try {
		this.visit(ast)
	} catch (error) {
		if (error !== RulesetExtender.stop)
			throw error
	}
}

RulesetExtender.prototype.visitRoot =
RulesetExtender.prototype.visitVoid =
RulesetExtender.prototype.visitRuleList = RulesetExtender.prototype.visitNode

RulesetExtender.prototype.visitNode = _.noop

RulesetExtender.prototype.visitExtend = function(extendNode) {
	if (extendNode === this.extendNode)
		throw RulesetExtender.stop
}

RulesetExtender.prototype.visitRuleset = function(rulesetNode) {
	var selectorListNode = rulesetNode.children[0]

	var selectorMatched = selectorListNode.children.some(function(selectorNode) {
		if (this.extendNode.all) {
			var startIndex = Node.containSelector(this.selectorNode, selectorNode)
			if (~startIndex) {
				var endIndex = this.selectorNode.children.length
				var parentSelectors = []
				this.parentSelectorList.children.forEach(function(parentSelector) {
					var pre = selectorNode.children.slice(0, startIndex)
					var post = selectorNode.children.slice(endIndex)
					parentSelector = Node.clone(parentSelector, true)
					parentSelector.children = pre.concat(parentSelector.children, post)
					parentSelectors.push(parentSelector)
				})

				var parentSelectorList = Node.clone(this.parentSelectorList, true)
				parentSelectorList.children = parentSelectors
				new SelectorExtender().extend(rulesetNode, parentSelectorList, this.options)
				return true
			}
		} else if (Node.equal(this.selectorNode, selectorNode)) {
			new SelectorExtender().extend(rulesetNode, this.parentSelectorList, this.options)
			return true
		}
	}, this)

	if (selectorMatched)
		return

	var ruleListNode = rulesetNode.children[1]
	this.visit(ruleListNode)
}