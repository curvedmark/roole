/**
 * Ruleset Filter
 *
 * Find ruleset node matching the passed selector
 */
'use strict';

var _ = require('../helper');
var Node = require('../node');
var Visitor = require('../visitor');
var RulesetFilter = module.exports = function() {};

RulesetFilter.stop = {};

RulesetFilter.prototype = new Visitor();

RulesetFilter.prototype.filter = function(ast, selectorNode, options) {
	this.selectorNode = selectorNode;
	this.extendNode = options.extendNode;
	this.options = options;
	this.rulesetNodes = [];

	try {
		this.visit(ast);
	} catch (error) {
		if (error !== RulesetFilter.stop) {
			throw error;
		}
	}

	return this.rulesetNodes;
};

RulesetFilter.prototype.visitRoot =
RulesetFilter.prototype.visitVoid =
RulesetFilter.prototype.visitRuleList = RulesetFilter.prototype.visitNode;

RulesetFilter.prototype.visitNode = _.noop;

RulesetFilter.prototype.visitExtend = function(extendNode) {
	if (extendNode === this.extendNode) {
		throw RulesetFilter.stop;
	}
};

RulesetFilter.prototype.visitRuleset = function(rulesetNode) {
	var selectorListNode = rulesetNode.children[0];

	var selectorMatched = selectorListNode.children.some(function(selectorNode) {
		if (Node.equal(this.selectorNode, selectorNode)) {
			this.rulesetNodes.push(rulesetNode);
			return true;
		}
	}, this);
	if (selectorMatched) {
		return;
	}

	var ruleListNode = rulesetNode.children[1];
	this.visit(ruleListNode);
};