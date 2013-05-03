'use strict';

var Normalizer = require('../');

Normalizer.prototype.visitRuleset = function(ruleset) {
	var selectorList = ruleset.children[0];
	if (this.inVoid) {
		if (!selectorList.extendedSelectors) return null;
		selectorList.children = selectorList.extendedSelectors;
	}

	var parentSelectorList = this.parentSelectorList;
	this.parentSelectorList = selectorList;

	var ruleList = ruleset.children[1];
	var children = this.visit(ruleList.children);

	this.parentSelectorList = parentSelectorList;

	var props = [];
	var rules = [];
	children.forEach(function (child) {
		if (child.type === 'property') props.push(child);
		else rules.push(child);
	});
	if (!props.length) return rules;
	rules.forEach(function (rule) {
		if (rule.level === undefined) rule.level = 0;
		++rule.level;
	});

	ruleList = {
		type: 'ruleList',
		children: props,
		loc: props[0].loc,
	};
	ruleset.children[1] = ruleList;
	rules.unshift(ruleset);

	return rules;
};