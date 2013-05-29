/**
 * Selector Extender
 *
 * Extend selectors in the passed rulesets with the passed selector list
 */
'use strict';

var _ = require('../helper');
var Node = require('../node');
var Visitor = require('../visitor');
var SelectorJoiner = require('./SelectorJoiner');

module.exports = RulesetExtender;

function RulesetExtender(options) {
	this.options = options;
	this.selectorList = options.selectorList;
}

RulesetExtender.stop = {};

RulesetExtender.prototype = new Visitor();

RulesetExtender.prototype.extend = function (rulesets) {
	rulesets.forEach(function (ruleset) {
		var selList = ruleset.children[0];
		selList.children = selList.children.concat(this.selectorList.children);

		if (this.options.recordExtend) {
			if (!selList.extended) selList.extended = [];
			selList.extended = selList.extended.concat(this.selectorList.children);
		}
		try { this.visit(ruleset.children[1]); }
		catch (err) { if (err !== RulesetExtender.stop) throw err; }
	}, this);
};

RulesetExtender.prototype._visit = function (node) {
	if (node !== Object(node)) return node;
	if (node === this.options.stop) throw RulesetExtender.stop;
	var name = 'visit' + _.capitalize(node.type);
	if (name in this) return this[name](node);
};

RulesetExtender.prototype.visitMedia =
RulesetExtender.prototype.visitRuleList = function (node) {
	this.visit(node.children);
};

RulesetExtender.prototype.visitRuleset = function (ruleset) {
	var parentSelList = this.selectorList;
	this.visit(ruleset.children);
	this.selectorList = parentSelList;
};

RulesetExtender.prototype.visitSelectorList = function (selList) {
	var clone = Node.clone(selList.original);
	new SelectorJoiner().join(this.selectorList, clone);
	selList.children = selList.children.concat(clone.children);

	if (this.options.recordExtend) {
		if (!selList.extended) selList.extended = [];
		selList.extended = selList.extended.concat(clone.children);
	}
	this.selectorList = clone;
};