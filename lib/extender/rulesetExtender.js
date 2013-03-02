/**
 * Ruleset Extender
 *
 * Find ruleset node matching the passed selector and extend them with the
 * passed parent selectors
 */
'use strict'

var _ = require('../helper')
var Visitor = require('../visitor')
var SelectorExtender = require('./selectorExtender')

var RulesetExtender = module.exports = function() {}

RulesetExtender.stop = {}

RulesetExtender.prototype = new Visitor()

RulesetExtender.prototype.extend = function(ast, selectorNode, parentSelectors, options) {
	this.parentSelectors = parentSelectors
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
			if (~selectorNode.indexOf(this.selectorNode)) {
				var parentSelectors = []
				this.parentSelectors.forEach(function(parentSelector) {
					parentSelector = selectorNode.split(this.selectorNode).join(parentSelector)
					parentSelectors.push(parentSelector)
				}, this)

				new SelectorExtender().extend(rulesetNode, parentSelectors, this.options)
				return true
			}
		} else if (this.selectorNode === selectorNode) {
			new SelectorExtender().extend(rulesetNode, this.parentSelectors, this.options)
			return true
		}
	}, this)

	if (selectorMatched)
		return

	var ruleListNode = rulesetNode.children[1]
	this.visit(ruleListNode)
}