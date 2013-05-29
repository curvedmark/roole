/**
 * Ruleset Filter
 *
 * Find ruleset node matching the passed selector
 */
'use strict';

var _ = require('../helper');
var Node = require('../node');
var Visitor = require('../visitor');

module.exports = RulesetFilter;

function RulesetFilter(options) {
	this.options = options;
	this.selector = options.selector;
	this.rulesets = [];
}

RulesetFilter.stop = {};

RulesetFilter.prototype = new Visitor();

RulesetFilter.prototype.filter = function(nodes) {
	try { this.visit(nodes); }
	catch (err) { if (err !== RulesetFilter.stop) throw err; }
	return this.rulesets;
};

RulesetFilter.prototype._visit = function (node) {
	if (node !== Object(node)) return node;
	if (node === this.options.stop) throw RulesetFilter.stop;
	var name = 'visit' + _.capitalize(node.type);
	if (name in this) return this[name](node);
};

RulesetFilter.prototype.visitVoid =
RulesetFilter.prototype.visitRuleList = function (node) {
	this.visit(node.children);
};

RulesetFilter.prototype.visitRuleset = function(ruleset) {
	var selList = ruleset.children[0];
	var matched = selList.children.some(function(sel) {
		if (Node.equal(sel, this.selector)) this.rulesets.push(ruleset);
	}, this);
	if (matched) return true;
	this.visit(ruleset.children[1]);
};