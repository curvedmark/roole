'use strict';

var Err = require('../../err');
var Normalizer = require('../');

Normalizer.prototype.visitMedia = function(media) {
	var ruleList = media.children[1];
	var children = this.visit(ruleList.children);

	var props = [];
	var rulesets = [];
	var rules = [];
	children.forEach(function (child) {
		if (child.type === 'property') props.push(child);
		else if (child.type === 'ruleset') rulesets.push(child);
		else rules.push(child);
	});
	if (props.length) {
		if (!this.parentSelectorList) {
			throw Err('@media containing properties is not allowed at the top level', media);
		}
		var ruleList = {
			type: 'ruleList',
			children: props,
			loc: props[0].loc,
		};
		var ruleset = {
			type: 'ruleset',
			children: [this.parentSelectorList, ruleList],
		};
		rulesets.unshift(ruleset);
	}
	if (!rulesets.length) return rules;

	rules.forEach(function (rule) {
		if (rule.level === undefined) rule.level = 0;
		if (rule.type === 'media' && !rule.nested) {
			rule.nested = true;
			rule.level = 1;
		} else {
			++rule.level;
		}
	});
	var ruleList = {
		type: 'ruleList',
		children: rulesets,
		loc: rulesets[0].loc,
	};
	media.children[1] = ruleList;
	rules.unshift(media);

	return rules;
};