/**
 * Normalizer
 *
 * Remove empty rulesets or medias, and unextended rulesets inside voids.
 */
'use strict';

var _ = require('../helper');
var RooleError = require('../error');
var Translator = require('../visitor/translator');

module.exports = Normalizer;

function Normalizer() {}

Normalizer.prototype = new Translator();

Normalizer.prototype.normalize = function(node) {
	this.visit(node.children);
	return node;
};

Normalizer.prototype._visit = function (node) {
	if (node !== Object(node)) return node;
	var name = 'visit' + _.capitalize(node.type);
	if (name in this) return this[name](node);
};

Normalizer.prototype.visitRuleset = function (ruleset) {
	var selList = ruleset.children[0];
	if (this.void) {
		if (!selList.extended) return null;
		selList.children = selList.extended;
	}
	var parentSelList = this.selectorList;
	this.selectorList = selList;
	var ruleList = ruleset.children[1];
	var children = this.visit(ruleList.children);
	this.selectorList = parentSelList;

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

Normalizer.prototype.visitVoid = function (voidNode) {
	var parentVoid = this.void;
	this.void = voidNode;
	var ruleList = voidNode.children[0];
	var children = this.visit(ruleList.children);
	this.void = parentVoid;
	return children;
};

Normalizer.prototype.visitMedia = function (media) {
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
		if (!this.selectorList) {
			throw new RooleError('@media containing properties is not allowed at the top level', media);
		}
		var ruleList = {
			type: 'ruleList',
			children: props,
			loc: props[0].loc,
		};
		var ruleset = {
			type: 'ruleset',
			children: [this.selectorList, ruleList],
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

Normalizer.prototype.visitKeyframes = function (keyframes) {
	var ruleList = keyframes.children[1];
	var children = this.visit(ruleList.children);
	if (!children.length) return null;
};

Normalizer.prototype.visitKeyframe = function (keyframe) {
	if (!keyframe.children[1].children.length) return null;
};

Normalizer.prototype.visitFontFace = function (fontFace) {
	if (!fontFace.children[0].children.length) return null;
};