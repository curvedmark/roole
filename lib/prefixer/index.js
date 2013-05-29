/**
 * Prefixer
 *
 * Prefix property nodes, keyframes nodes, etc
 */
'use strict';

var _ = require('../helper');
var Translator = require('../visitor/translator');
var Node = require('../node');
var PropertyNamePrefixer = require('./propertyNamePrefixer');
var LinearGradientPrefixer = require('./linearGradientPrefixer');
module.exports = Prefixer;

function Prefixer(options) {
	this.options = options;
}

Prefixer.prototype = new Translator();

Prefixer.prototype.prefix = function(node) {
	this.prefixes = this.options.prefix.trim().split(/\s+/);
	return this.visit(node);
};

Prefixer.prototype._visit = function (node) {
	if (node !== Object(node)) return node;
	var name = 'visit' + _.capitalize(node.type);
	if (name in this) return this[name](node);
};

Prefixer.prototype.visitStylesheet =
Prefixer.prototype.visitMedia =
Prefixer.prototype.visitKeyframeList =
Prefixer.prototype.visitKeyframe =
Prefixer.prototype.visitRuleList = function (node) {
	this.visit(node.children);
};

Prefixer.prototype.visitRuleset = function(ruleset) {
	var ruleList = ruleset.children[1];

	if (this.options.skipPrefixed) {
		var properties = this.properties;
		this.properties = ruleList.children;
		this.visit(ruleList.children);
		this.properties = properties;
	} else {
		this.visit(ruleList.children);
	}
};

Prefixer.prototype.visitProperty = function(prop) {
	var ident = prop.children[0];
	var val = prop.children[1];
	var name = ident.children[0];
	var props = [];
	var options = { prefixes: this.prefixes };

	switch (name) {
	case 'background':
	case 'background-image':
		var vals = new LinearGradientPrefixer(options).prefix(val);
		vals.forEach(function(val) {
			var clone = Node.clone(prop, false);
			clone.children = [ident, val];
			props.push(clone);
		});
		break;
	default:
		options.properties = this.properties;
		var names = new PropertyNamePrefixer(options).prefix(ident);
		names.forEach(function(name) {
			var clone = Node.clone(prop, false);
			clone.children = [name, val];
			props.push(clone);
		});
	}
	if (!props.length) return;

	props.push(prop);
	return props;
};

Prefixer.prototype.visitKeyframes = function(keyframes) {
	var prefix = keyframes.prefix;
	if (prefix) return;
	var name = this.visit(keyframes.children[0]);
	var ruleList = keyframes.children[1];
	var prefixes = _.intersect(this.prefixes, ['webkit', 'moz', 'o']);
	var keyframesNodes = [];

	prefixes.forEach(function(prefix) {
		this.prefixes = [prefix];
		var ruleListClone = Node.clone(ruleList);
		this.visit(ruleListClone);

		var keyframesClone = Node.clone(keyframes, false);
		keyframesClone.prefix = prefix;
		keyframesClone.children = [name, ruleListClone];

		keyframesNodes.push(keyframesClone);
	}, this);

	keyframesNodes.push(keyframes);

	return keyframesNodes;
};