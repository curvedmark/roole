'use strict';

var Err = require('../../err');
var Normalizer = require('../');

Normalizer.prototype.visitMedia = function(media) {
	var level;
	if (this.parentMedia) {
		media.level = this.parentMedia.level + 1;
		level = this.level;
		this.level = 0;
	} else {
		level = media.level = this.level;
		this.level = 0;
	}
	var parentMedia = this.parentMedia;
	this.parentMedia = media;

	var ruleList = media.children[1];
	var children = this.visit(ruleList.children);

	this.level = level;
	this.parentMedia = parentMedia;

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
			level: 0,
		};
		rulesets.unshift(ruleset);
	}
	if (rulesets.length) {
		var ruleList = {
			type: 'ruleList',
			children: rulesets,
			loc: rulesets[0].loc,
		};
		media.children[1] = ruleList;
		rules.unshift(media);
	} else {
		rules.forEach(function (rule) {
			if (rule.level) --rule.level;
		});
	}
	return rules;
};